import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { companySchema } from "@/lib/validations/schemas"

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

    const company = await prisma.company.findFirst({
      where: { id, workspaceId: workspace.id },
      include: {
        contacts: { select: { id: true, firstName: true, lastName: true, email: true, title: true } },
        deals: { orderBy: { createdAt: "desc" } },
      },
    })
    if (!company) return Response.json({ error: "Company not found" }, { status: 404 })
    return Response.json(company)
  } catch (err) {
    console.error("[GET /api/crm/companies/[id]]", err)
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
    const parsed = companySchema.partial().safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.company.updateMany({
      where: { id, workspaceId: workspace.id },
      data: parsed.data,
    })
    if (updated.count === 0) return Response.json({ error: "Company not found" }, { status: 404 })
    return Response.json({ success: true })
  } catch (err) {
    console.error("[PATCH /api/crm/companies/[id]]", err)
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

    await prisma.company.deleteMany({ where: { id, workspaceId: workspace.id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("[DELETE /api/crm/companies/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
