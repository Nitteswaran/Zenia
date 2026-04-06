import { NextRequest } from "next/server"
import { requireSuperAdmin } from "@/lib/admin/require-super-admin"
import { prisma } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/lib/plan-limits"
import { z } from "zod"

export const runtime = "nodejs"

const schema = z.object({
  plan: z.enum(["FREE", "STARTER", "GROWTH", "BUSINESS", "ENTERPRISE"]),
})

/**
 * PATCH /api/admin/workspaces/[id]/plan
 * Manually sets the plan for a workspace without going through Stripe.
 * Restricted to SUPER_ADMIN users.
 *
 * Body: { plan: "GROWTH" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdmin()
    if (!auth.ok) return auth.response

    const { id } = await params

    const workspace = await prisma.workspace.findUnique({ where: { id } })
    if (!workspace) {
      return Response.json({ error: "Workspace not found" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const { plan } = parsed.data
    const previousPlan = workspace.plan

    const updated = await prisma.workspace.update({
      where: { id },
      data: {
        plan,
        aiCreditsLimit: PLAN_LIMITS[plan].credits === -1
          ? 999999 // store a large number for "unlimited"
          : PLAN_LIMITS[plan].credits,
      },
      select: {
        id: true,
        name: true,
        plan: true,
        aiCreditsLimit: true,
        aiCreditsUsed: true,
      },
    })

    console.info(
      `[ADMIN] Plan updated: workspace=${id} ${previousPlan} → ${plan} by admin=${auth.dbUser.email}`
    )

    return Response.json({ workspace: updated, previousPlan })
  } catch (err) {
    console.error("[PATCH /api/admin/workspaces/[id]/plan]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
