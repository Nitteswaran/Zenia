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
    const platform = searchParams.get("platform") ?? undefined
    const days = Math.min(365, parseInt(searchParams.get("days") ?? "30", 10))
    const since = new Date()
    since.setDate(since.getDate() - days)

    const where = {
      workspaceId: workspace.id,
      publishedAt: { gte: since },
      status: "PUBLISHED" as const,
      ...(platform ? { platform: platform as never } : {}),
    }

    const posts = await prisma.socialPost.findMany({
      where,
      select: {
        id: true,
        platform: true,
        caption: true,
        publishedAt: true,
        metrics: true,
      },
      orderBy: { publishedAt: "desc" },
    })

    // Aggregate metrics per platform
    const byPlatform: Record<string, { posts: number; impressions: number; engagements: number; reach: number }> = {}
    for (const post of posts) {
      const p = post.platform
      if (!byPlatform[p]) byPlatform[p] = { posts: 0, impressions: 0, engagements: 0, reach: 0 }
      byPlatform[p].posts++
      const m = post.metrics as Record<string, number> | null
      if (m) {
        byPlatform[p].impressions += m.impressions ?? 0
        byPlatform[p].engagements += m.engagements ?? 0
        byPlatform[p].reach += m.reach ?? 0
      }
    }

    // Connected account count per platform
    const accounts = await prisma.socialAccount.findMany({
      where: { workspaceId: workspace.id, isActive: true },
      select: { platform: true, accountName: true, accountId: true },
    })

    return Response.json({ byPlatform, accounts, totalPosts: posts.length, posts })
  } catch (err) {
    console.error("[GET /api/social/analytics]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
