import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const [campaigns, content, contacts, deals, automations, socialAccounts] = await Promise.all([
      prisma.campaign.count({ where: { workspaceId: workspace.id } }),
      prisma.content.count({ where: { workspaceId: workspace.id } }),
      prisma.contact.count({ where: { workspaceId: workspace.id } }),
      prisma.deal.count({ where: { workspaceId: workspace.id } }),
      prisma.automation.count({ where: { workspaceId: workspace.id } }),
      prisma.socialAccount.count({ where: { workspaceId: workspace.id, isActive: true } }),
    ])

    return Response.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        plan: workspace.plan,
        aiCreditsUsed: workspace.aiCreditsUsed,
        aiCreditsLimit: workspace.aiCreditsLimit,
      },
      counts: { campaigns, content, contacts, deals, automations, socialAccounts },
    })
  } catch (err) {
    console.error("[GET /api/workspace/stats]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
