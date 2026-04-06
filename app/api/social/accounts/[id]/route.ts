import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

async function getWorkspace(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  return dbUser?.workspaceMembers[0]?.workspace ?? null
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspace(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const { id } = await params

    const deleted = await prisma.socialAccount.deleteMany({
      where: { id, workspaceId: workspace.id },
    })

    if (deleted.count === 0) {
      return Response.json({ error: "Account not found" }, { status: 404 })
    }

    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("[DELETE /api/social/accounts/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspace(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const { id } = await params
    const body = await req.json()

    const account = await prisma.socialAccount.updateMany({
      where: { id, workspaceId: workspace.id },
      data: {
        isActive: body.isActive,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        tokenExpiry: body.tokenExpiry ? new Date(body.tokenExpiry) : undefined,
      },
    })

    if (account.count === 0) {
      return Response.json({ error: "Account not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("[PATCH /api/social/accounts/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
