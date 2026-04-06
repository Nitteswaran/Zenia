import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { dealSchema } from "@/lib/validations/schemas"

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const stage = searchParams.get("stage") ?? undefined

    const deals = await prisma.deal.findMany({
      where: { workspaceId: workspace.id, ...(stage ? { stage: stage as never } : {}) },
      orderBy: { createdAt: "desc" },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        company: { select: { id: true, name: true } },
      },
    })

    return Response.json(deals)
  } catch (err) {
    console.error("[GET /api/crm/deals]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
    const parsed = dealSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const deal = await prisma.deal.create({
      data: { ...parsed.data, workspaceId: workspace.id },
    })

    return Response.json(deal, { status: 201 })
  } catch (err) {
    console.error("[POST /api/crm/deals]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
