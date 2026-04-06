import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { createBillingPortalSession } from "@/lib/stripe/client"

export const runtime = "nodejs"

export async function POST(_req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } })
    if (!dbUser?.stripeCustomerId) {
      return Response.json({ error: "No billing account found. Please subscribe to a plan first." }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const session = await createBillingPortalSession({
      customerId: dbUser.stripeCustomerId,
      returnUrl: `${appUrl}/settings/billing`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error("[POST /api/billing/portal]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
