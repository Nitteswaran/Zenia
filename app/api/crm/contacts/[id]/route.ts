import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { contactSchema } from "@/lib/validations/schemas"

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

    const contact = await prisma.contact.findFirst({
      where: { id, workspaceId: workspace.id },
      include: {
        company: true,
        deals: { include: { company: true } },
        activities: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    })
    if (!contact) return Response.json({ error: "Contact not found" }, { status: 404 })
    return Response.json(contact)
  } catch (err) {
    console.error("[GET /api/crm/contacts/[id]]", err)
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
    const parsed = contactSchema.partial().safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.contact.updateMany({
      where: { id, workspaceId: workspace.id },
      data: parsed.data,
    })
    if (updated.count === 0) return Response.json({ error: "Contact not found" }, { status: 404 })
    return Response.json({ success: true })
  } catch (err) {
    console.error("[PATCH /api/crm/contacts/[id]]", err)
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

    await prisma.contact.deleteMany({ where: { id, workspaceId: workspace.id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("[DELETE /api/crm/contacts/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
