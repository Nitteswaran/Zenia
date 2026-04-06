import { NextRequest } from "next/server"
import { constructWebhookEvent } from "@/lib/stripe/client"
import { getPlanFromPriceId } from "@/lib/stripe/plans"
import { prisma } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/lib/plan-limits"
import type Stripe from "stripe"

export const runtime = "nodejs"

// Stripe requires the raw body for signature verification
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = await constructWebhookEvent(body, signature)
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err)
    return Response.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== "subscription") break

        const workspaceId = session.metadata?.workspaceId
        const userId = session.metadata?.userId
        if (!workspaceId || !userId) {
          console.error("[Stripe Webhook] Missing metadata on checkout.session.completed")
          break
        }

        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        // Determine plan from subscription
        const stripe = (await import("@/lib/stripe/client")).getStripeClient()
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? getPlanFromPriceId(priceId) : null

        await prisma.$transaction([
          prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              stripeSubId: subscriptionId,
              plan: plan ?? "STARTER",
              aiCreditsLimit: PLAN_LIMITS[plan ?? "STARTER"].credits,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          }),
        ])
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const workspaceId = subscription.metadata?.workspaceId
        if (!workspaceId) break

        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? getPlanFromPriceId(priceId) : null

        const isActive =
          subscription.status === "active" || subscription.status === "trialing"

        if (isActive && plan) {
          await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              stripeSubId: subscription.id,
              plan,
              aiCreditsLimit: PLAN_LIMITS[plan].credits,
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const workspaceId = subscription.metadata?.workspaceId
        if (!workspaceId) break

        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: "FREE",
            stripeSubId: null,
            aiCreditsLimit: PLAN_LIMITS.FREE.credits,
          },
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id

        if (!subscriptionId) break

        // Reset monthly AI credits on successful renewal
        const workspace = await prisma.workspace.findFirst({
          where: { stripeSubId: subscriptionId },
        })
        if (workspace) {
          await prisma.workspace.update({
            where: { id: workspace.id },
            data: { aiCreditsUsed: 0 },
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id

        if (!customerId) break

        // Notify user of payment failure via notification
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "Payment Failed",
              body: "Your latest invoice payment failed. Please update your payment method to avoid service interruption.",
              type: "billing",
            },
          })
        }
        break
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription
        const workspaceId = subscription.metadata?.workspaceId
        if (!workspaceId) break

        const workspace = await prisma.workspace.findUnique({
          where: { id: workspaceId },
          include: { members: { include: { user: true }, take: 1 } },
        })
        const ownerUser = workspace?.members[0]?.user
        if (ownerUser) {
          await prisma.notification.create({
            data: {
              userId: ownerUser.id,
              title: "Trial Ending Soon",
              body: "Your free trial ends in 3 days. Add a payment method to continue using Zenia.",
              type: "billing",
            },
          })
        }
        break
      }

      default:
        // Unhandled event — ignore
        break
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Error processing event ${event.type}:`, err)
    return Response.json({ error: "Webhook handler error" }, { status: 500 })
  }

  return Response.json({ received: true })
}
