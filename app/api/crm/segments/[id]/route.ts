import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { segmentSchema } from "@/lib/validations/schemas"
import { buildSegmentWhere } from "@/lib/crm/segment-matcher"
import type { SegmentFilters } from "@/types"

async function getWorkspaceFromAuth(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  return dbUser?.workspaceMembers[0]?.workspace ?? null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const segment = await prisma.segment.findFirst({ where: { id, workspaceId: workspace.id } })
    if (!segment) return Response.json({ error: "Not found" }, { status: 404 })

    return Response.json(segment)
  } catch (err) {
    console.error("[GET /api/crm/segments/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const body = await req.json()
    const parsed = segmentSchema.partial().safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (parsed.data.name) updateData.name = parsed.data.name
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description
    if (parsed.data.filters) {
      updateData.filters = parsed.data.filters
      // Refresh contact count when filters change
      const where = buildSegmentWhere(workspace.id, parsed.data.filters as SegmentFilters)
      updateData.contactCount = await prisma.contact.count({ where })
    }

    await prisma.segment.updateMany({ where: { id, workspaceId: workspace.id }, data: updateData as never })
    const updated = await prisma.segment.findFirst({ where: { id, workspaceId: workspace.id } })
    return Response.json(updated)
  } catch (err) {
    console.error("[PATCH /api/crm/segments/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    await prisma.segment.deleteMany({ where: { id, workspaceId: workspace.id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("[DELETE /api/crm/segments/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
