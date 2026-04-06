import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { automationSchema } from "@/lib/validations/schemas"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const automation = await prisma.automation.findFirst({
      where: { id, workspaceId: workspace.id },
      include: { logs: { orderBy: { createdAt: "desc" }, take: 20 } },
    })
    if (!automation) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(automation)
  } catch (err) {
    console.error("[GET /api/automation/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const body = await req.json()
    const parsed = automationSchema.partial().safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    // Allow direct status-only updates (bypass full schema validation)
    const statusOnly = (body as Record<string, unknown>).status
    if (statusOnly && Object.keys(body as object).length === 1) {
      if (!["ACTIVE", "INACTIVE", "DRAFT"].includes(statusOnly as string)) {
        return Response.json({ error: "Invalid status" }, { status: 400 })
      }
      await prisma.automation.updateMany({
        where: { id, workspaceId: workspace.id },
        data: { status: statusOnly as never },
      })
      return Response.json({ success: true })
    }

    const data = parsed.data
    await prisma.automation.updateMany({
      where: { id, workspaceId: workspace.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.trigger ? { trigger: data.trigger as never } : {}),
        ...(data.steps ? { steps: data.steps as never } : {}),
      },
    })
    return Response.json({ success: true })
  } catch (err) {
    console.error("[PATCH /api/automation/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    await prisma.automation.deleteMany({ where: { id, workspaceId: workspace.id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("[DELETE /api/automation/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
