import { NextRequest } from "next/server"
import { validateApiKey } from "@/lib/api/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const workspace = await validateApiKey(req)
  if (!workspace) return Response.json({ error: "Invalid or missing API key" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(365, parseInt(searchParams.get("days") ?? "30", 10))
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [campaigns, contacts, content, socialPosts] = await Promise.all([
    prisma.campaign.findMany({
      where: { workspaceId: workspace.id },
      include: { analytics: true },
    }),
    prisma.contact.count({ where: { workspaceId: workspace.id } }),
    prisma.content.count({ where: { workspaceId: workspace.id } }),
    prisma.socialPost.count({ where: { workspaceId: workspace.id, status: "PUBLISHED" } }),
  ])

  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.analytics?.revenue ?? 0), 0)
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.analytics?.impressions ?? 0), 0)

  return Response.json({
    period: `${days}d`,
    totals: {
      campaigns: campaigns.length,
      contacts,
      contentPieces: content,
      publishedPosts: socialPosts,
      revenue: totalRevenue,
      impressions: totalImpressions,
    },
    aiCredits: {
      used: workspace.aiCreditsUsed,
      limit: workspace.aiCreditsLimit,
      remaining: Math.max(0, workspace.aiCreditsLimit - workspace.aiCreditsUsed),
    },
  })
}
