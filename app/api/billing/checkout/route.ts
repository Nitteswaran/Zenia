import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { createCheckoutSession, createCustomer } from "@/lib/stripe/client"
import { getPriceId } from "@/lib/stripe/plans"
import { z } from "zod"

export const runtime = "nodejs"

const schema = z.object({
  plan: z.enum(["STARTER", "GROWTH", "BUSINESS", "ENTERPRISE"]),
  billing: z.enum(["monthly", "yearly"]),
})

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace || !dbUser) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const { plan, billing } = parsed.data
    const priceId = getPriceId(plan, billing)
    if (!priceId) {
      return Response.json({ error: "Invalid plan or billing period" }, { status: 400 })
    }

    // Create or retrieve Stripe customer
    let customerId = dbUser.stripeCustomerId ?? undefined
    if (!customerId) {
      const customer = await createCustomer({
        email: dbUser.email,
        name: dbUser.name ?? undefined,
        metadata: { userId: dbUser.id, workspaceId: workspace.id },
      })
      customerId = customer.id
      await prisma.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId: customerId } })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const session = await createCheckoutSession({
      customerId,
      priceId,
      workspaceId: workspace.id,
      userId: dbUser.id,
      successUrl: `${appUrl}/settings/billing?success=1`,
      cancelUrl: `${appUrl}/settings/billing?canceled=1`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error("[POST /api/billing/checkout]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
