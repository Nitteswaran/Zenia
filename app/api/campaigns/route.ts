import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { campaignSchema } from "@/lib/validations/schemas"
import { withApiGuard } from "@/lib/middleware/api-guard"
import { PLAN_LIMITS } from "@/lib/plan-limits"
import type { Plan } from "@prisma/client"

export const GET = withApiGuard(async (_req, { workspace }) => {
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: {
      analytics: true,
      _count: { select: { content: true, socialPosts: true } },
    },
  })
  return Response.json(campaigns)
})

export const POST = withApiGuard(async (req: NextRequest, { workspace }) => {
  const plan = workspace.plan as Plan
  const limit = PLAN_LIMITS[plan].campaigns
  if (limit !== -1) {
    const count = await prisma.campaign.count({ where: { workspaceId: workspace.id } })
    if (count >= limit) {
      return Response.json(
        { error: `Your ${plan} plan allows up to ${limit} campaigns. Please upgrade.` },
        { status: 402 }
      )
    }
  }

  const body = await req.json()
  const parsed = campaignSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
  }

  const { targetAudience, ...campaignData } = parsed.data
  const campaign = await prisma.campaign.create({
    data: {
      ...campaignData,
      channels: Array.isArray(campaignData.channels) ? campaignData.channels : [],
      workspaceId: workspace.id,
      ...(targetAudience !== undefined ? { targetAudience: targetAudience as never } : {}),
      analytics: { create: {} },
    },
  })
  return Response.json(campaign, { status: 201 })
})
