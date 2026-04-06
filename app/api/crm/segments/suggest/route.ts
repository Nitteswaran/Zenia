import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import type { SegmentFilters } from "@/types"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

async function getWorkspaceFromAuth(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  return dbUser?.workspaceMembers[0]?.workspace ?? null
}

export async function POST(_req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    // Gather aggregate stats
    const [
      statusDist,
      tagSample,
      sourceDist,
      totalContacts,
      highScoreCount,
      recentActivityCount,
      inactiveCount,
    ] = await Promise.all([
      prisma.contact.groupBy({ by: ["status"], where: { workspaceId: workspace.id }, _count: true }),
      prisma.contact.findMany({ where: { workspaceId: workspace.id }, select: { tags: true }, take: 200 }),
      prisma.contact.groupBy({ by: ["source"], where: { workspaceId: workspace.id }, _count: true }),
      prisma.contact.count({ where: { workspaceId: workspace.id } }),
      prisma.contact.count({ where: { workspaceId: workspace.id, score: { gte: 65 } } }),
      prisma.contact.count({
        where: {
          workspaceId: workspace.id,
          lastInteractionAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
        },
      }),
      prisma.contact.count({
        where: {
          workspaceId: workspace.id,
          lastInteractionAt: { lte: new Date(Date.now() - 90 * 86_400_000) },
        },
      }),
    ])

    // Flatten all tags
    const tagCounts: Record<string, number> = {}
    for (const c of tagSample) {
      for (const t of c.tags) tagCounts[t] = (tagCounts[t] ?? 0) + 1
    }
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => `${tag} (${count})`)

    const prompt = `You are a CRM analyst. Based on the following contact data, suggest 5 useful, actionable contact segments.

WORKSPACE DATA:
- Total contacts: ${totalContacts}
- Status distribution: ${statusDist.map((s) => `${s.status}: ${s._count}`).join(", ")}
- Top tags: ${topTags.join(", ") || "none"}
- Top sources: ${sourceDist.slice(0, 5).map((s) => `${s.source ?? "unknown"}: ${s._count}`).join(", ")}
- High score contacts (≥65): ${highScoreCount}
- Active last 30 days: ${recentActivityCount}
- Inactive 90+ days: ${inactiveCount}

Return exactly a JSON array (no markdown, no extra text) of 5 segment objects, each with:
{
  "name": "string (short, descriptive)",
  "description": "string (1 sentence why this segment matters)",
  "filters": {
    "conditions": [
      { "field": "status|score|tags|source|lifecycleStage|lastInteractionAt|createdAt", "operator": "equals|not_equals|contains|in|not_in|gte|lte|within_days|older_than_days", "value": "string or number or array" }
    ],
    "logic": "AND"
  }
}

Valid fields: status, score, tags, source, lifecycleStage, lastInteractionAt, createdAt
Valid status values: NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CUSTOMER, CHURNED
Use "within_days" with a numeric value for date fields (e.g., value: 30 for last 30 days).
Use "gte" for score with numeric values.
Make segments that are realistic and actionable given the data above.`

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = message.content[0]?.type === "text" ? message.content[0].text.trim() : "[]"

    let suggestions: Array<{ name: string; description: string; filters: SegmentFilters }> = []
    try {
      suggestions = JSON.parse(raw) as typeof suggestions
    } catch {
      return Response.json({ error: "AI returned invalid JSON" }, { status: 500 })
    }

    // Deduct 1 AI credit
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { aiCreditsUsed: { increment: 1 } },
    })

    return Response.json(suggestions)
  } catch (err) {
    console.error("[POST /api/crm/segments/suggest]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
