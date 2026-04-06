import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const days = Math.min(365, parseInt(searchParams.get("days") ?? "30", 10))

    const since = new Date()
    since.setDate(since.getDate() - days)

    const [allContent, publishedContent] = await Promise.all([
      prisma.content.findMany({
        where: { workspaceId: workspace.id, createdAt: { gte: since } },
        select: { createdAt: true, type: true, aiGenerated: true },
      }),
      prisma.content.count({
        where: { workspaceId: workspace.id, status: "PUBLISHED", createdAt: { gte: since } },
      }),
    ])

    // Group by day
    const byDayMap: Record<string, { generated: number; published: number }> = {}
    for (const c of allContent) {
      const d = new Date(c.createdAt).toISOString().slice(0, 10)
      if (!byDayMap[d]) byDayMap[d] = { generated: 0, published: 0 }
      byDayMap[d].generated++
    }
    const byDay = Object.entries(byDayMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Group by type
    const byTypeMap: Record<string, number> = {}
    for (const c of allContent) {
      byTypeMap[c.type] = (byTypeMap[c.type] ?? 0) + 1
    }
    const byType = Object.entries(byTypeMap).map(([type, count]) => ({ type, count }))

    return Response.json({
      byDay,
      byType,
      totalGenerated: allContent.length,
      totalPublished: publishedContent,
      creditsUsed: workspace.aiCreditsUsed,
    })
  } catch (err) {
    console.error("[GET /api/analytics/content]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
