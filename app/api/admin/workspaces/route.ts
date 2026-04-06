import { requireSuperAdmin } from "@/lib/admin/require-super-admin"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

/**
 * GET /api/admin/workspaces
 * Returns all workspaces with their owner and current plan.
 * Restricted to SUPER_ADMIN users.
 */
export async function GET() {
  try {
    const auth = await requireSuperAdmin()
    if (!auth.ok) return auth.response

    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        stripeSubId: true,
        aiCreditsUsed: true,
        aiCreditsLimit: true,
        createdAt: true,
        members: {
          where: { role: "OWNER" },
          take: 1,
          select: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return Response.json(workspaces)
  } catch (err) {
    console.error("[GET /api/admin/workspaces]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
