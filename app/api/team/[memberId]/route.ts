import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
})

async function getWorkspaceWithRole(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: {
      workspaceMembers: { include: { workspace: true }, take: 1 },
    },
  })
  const member = dbUser?.workspaceMembers[0]
  return { workspace: member?.workspace ?? null, role: member?.role ?? null, userId: dbUser?.id }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { workspace, role } = await getWorkspaceWithRole(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })
    if (role !== "OWNER") {
      return Response.json({ error: "Only the owner can change member roles" }, { status: 403 })
    }

    const { memberId } = await params
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    const updated = await prisma.workspaceMember.updateMany({
      where: { id: memberId, workspaceId: workspace.id },
      data: { role: parsed.data.role },
    })

    if (updated.count === 0) return Response.json({ error: "Member not found" }, { status: 404 })

    return Response.json({ success: true })
  } catch (err) {
    console.error("[PATCH /api/team/[memberId]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { workspace, role, userId } = await getWorkspaceWithRole(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const { memberId } = await params

    // Find the member to remove
    const member = await prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId: workspace.id },
    })
    if (!member) return Response.json({ error: "Member not found" }, { status: 404 })

    // Allow self-removal OR owner/admin removing others (can't remove owner)
    const isSelf = member.userId === userId
    if (!isSelf && role !== "OWNER" && role !== "ADMIN") {
      return Response.json({ error: "Insufficient permissions" }, { status: 403 })
    }
    if (member.role === "OWNER") {
      return Response.json({ error: "Cannot remove the workspace owner" }, { status: 400 })
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } })

    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("[DELETE /api/team/[memberId]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
