import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { campaignSchema } from "@/lib/validations/schemas"
import { fireTrigger } from "@/lib/automation/trigger"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authUser = await getAuthUser()
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { analytics: true, content: true, socialPosts: true },
  })
  if (!campaign) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(campaign)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authUser = await getAuthUser()
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

  const body = await req.json()
  const parsed = campaignSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
  }

  // Detect campaign going ACTIVE to fire trigger
  const existing = parsed.data.status === "ACTIVE"
    ? await prisma.campaign.findFirst({ where: { id, workspaceId: workspace.id }, select: { id: true, status: true, name: true } })
    : null

  const { targetAudience, ...rest } = parsed.data
  const campaign = await prisma.campaign.updateMany({
    where: { id, workspaceId: workspace.id },
    data: {
      ...rest,
      ...(targetAudience !== undefined ? { targetAudience: targetAudience as never } : {}),
    },
  })

  if (existing && existing.status !== "ACTIVE" && parsed.data.status === "ACTIVE") {
    void fireTrigger(workspace.id, "campaign_started", {
      triggerData: { campaignId: id, campaignName: existing.name },
    })
  }

  return Response.json(campaign)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authUser = await getAuthUser()
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

  await prisma.campaign.deleteMany({ where: { id, workspaceId: workspace.id } })
  return new Response(null, { status: 204 })
}
