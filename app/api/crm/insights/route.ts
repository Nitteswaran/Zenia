import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const CACHE_TTL_HOURS = 6

async function getWorkspaceFromAuth(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  return dbUser?.workspaceMembers[0]?.workspace ?? null
}

/** GET — return cached insights (regenerate if stale) */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const forceRefresh = searchParams.get("refresh") === "1"

    const staleCutoff = new Date(Date.now() - CACHE_TTL_HOURS * 3_600_000)
    const existing = await prisma.crmInsight.findMany({
      where: { workspaceId: workspace.id, generatedAt: { gte: staleCutoff } },
      orderBy: { generatedAt: "desc" },
      take: 8,
    })

    if (existing.length > 0 && !forceRefresh) {
      return Response.json(existing)
    }

    // Generate fresh insights
    const insights = await generateInsights(workspace.id)

    // Delete old, write new
    await prisma.crmInsight.deleteMany({ where: { workspaceId: workspace.id } })
    const created = await prisma.crmInsight.createMany({
      data: insights.map((i) => ({
        ...i,
        workspaceId: workspace.id,
        data: (i.data ?? {}) as never,
      })),
    })

    const fresh = await prisma.crmInsight.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { generatedAt: "desc" },
      take: 8,
    })

    // Deduct 1 AI credit
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { aiCreditsUsed: { increment: 1 } },
    })

    return Response.json(fresh)
  } catch (err) {
    console.error("[GET /api/crm/insights]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** POST — force regenerate */
export async function POST(_req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const insights = await generateInsights(workspace.id)

    await prisma.crmInsight.deleteMany({ where: { workspaceId: workspace.id } })
    await prisma.crmInsight.createMany({
      data: insights.map((i) => ({
        ...i,
        workspaceId: workspace.id,
        data: (i.data ?? {}) as never,
      })),
    })

    const fresh = await prisma.crmInsight.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { generatedAt: "desc" },
    })

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { aiCreditsUsed: { increment: 1 } },
    })

    return Response.json(fresh)
  } catch (err) {
    console.error("[POST /api/crm/insights]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateInsights(workspaceId: string) {
  // Gather data for analysis
  const [
    contacts,
    deals,
    statusDist,
    stageDist,
    hotContacts,
    coldContacts,
    campaigns,
    recentActivities,
  ] = await Promise.all([
    prisma.contact.count({ where: { workspaceId } }),
    prisma.deal.findMany({ where: { workspaceId }, select: { stage: true, value: true, probability: true } }),
    prisma.contact.groupBy({ by: ["status"], where: { workspaceId }, _count: true }),
    prisma.deal.groupBy({ by: ["stage"], where: { workspaceId }, _count: true, _sum: { value: true } }),
    prisma.contact.count({ where: { workspaceId, score: { gte: 65 } } }),
    prisma.contact.count({ where: { workspaceId, score: { lte: 20 } } }),
    prisma.campaign.findMany({
      where: { workspaceId },
      select: { id: true, name: true, status: true, type: true, channels: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.activity.count({
      where: {
        contact: { workspaceId },
        createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
      },
    }),
  ])

  const totalPipelineValue = deals
    .filter((d) => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage))
    .reduce((a, d) => a + d.value, 0)

  const wonDeals = deals.filter((d) => d.stage === "CLOSED_WON")
  const conversionRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(1) : "0"

  const prompt = `You are a CRM analytics AI. Analyze the following CRM data and return 5 actionable business insights.

CRM SNAPSHOT:
- Total contacts: ${contacts}
- Hot leads (score ≥65): ${hotContacts}
- Cold leads (score ≤20): ${coldContacts}
- Contact status breakdown: ${statusDist.map((s) => `${s.status}: ${s._count}`).join(", ")}
- Deal stage breakdown: ${stageDist.map((s) => `${s.stage}: ${s._count} deals ($${(s._sum.value ?? 0).toLocaleString()})`).join(", ")}
- Total pipeline value: $${totalPipelineValue.toLocaleString()}
- Won deals: ${wonDeals.length} (conversion rate: ${conversionRate}%)
- Recent campaigns: ${campaigns.map((c) => `${c.name} (${c.status})`).join(", ") || "none"}
- Activities last 30 days: ${recentActivities}

Generate exactly 5 insights as a JSON array (no markdown, raw JSON only). Each insight:
{
  "type": "engagement|conversion|segment|pipeline",
  "title": "short insight title (max 10 words)",
  "body": "2-3 sentence insight with specific numbers and a recommended action"
}

Focus on: conversion opportunities, at-risk contacts, pipeline health, engagement trends, quick wins.`

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1200,
    messages: [{ role: "user", content: prompt }],
  })

  const raw = message.content[0]?.type === "text" ? message.content[0].text.trim() : "[]"

  try {
    const parsed = JSON.parse(raw) as Array<{
      type: string
      title: string
      body: string
      data?: Record<string, unknown>
    }>
    return parsed.slice(0, 5)
  } catch {
    return [
      {
        type: "pipeline",
        title: "Pipeline analysis available",
        body: `Your CRM has ${contacts} contacts with $${totalPipelineValue.toLocaleString()} in active pipeline. ${hotContacts} leads are scored hot and ready for outreach.`,
      },
    ]
  }
}
