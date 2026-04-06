import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { dealSchema } from "@/lib/validations/schemas"
import { fireTrigger } from "@/lib/automation/trigger"

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
  const parsed = dealSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
  }

  // Fetch previous stage to detect changes
  const existing = parsed.data.stage
    ? await prisma.deal.findFirst({ where: { id, workspaceId: workspace.id }, select: { id: true, stage: true, contactId: true } })
    : null

  const deal = await prisma.deal.updateMany({ where: { id, workspaceId: workspace.id }, data: parsed.data })

  // Fire trigger if stage changed
  if (existing && parsed.data.stage && existing.stage !== parsed.data.stage) {
    void fireTrigger(workspace.id, "deal_stage_changed", {
      dealId: id,
      contactId: existing.contactId ?? undefined,
      triggerData: { dealId: id, previousStage: existing.stage, newStage: parsed.data.stage },
    })
  }

  return Response.json(deal)
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

  await prisma.deal.deleteMany({ where: { id, workspaceId: workspace.id } })
  return new Response(null, { status: 204 })
}
