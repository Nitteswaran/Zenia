import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { buildSegmentWhere } from "@/lib/crm/segment-matcher"
import type { SegmentFilters } from "@/types"

async function getWorkspaceFromAuth(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  return dbUser?.workspaceMembers[0]?.workspace ?? null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const segment = await prisma.segment.findFirst({ where: { id, workspaceId: workspace.id } })
    if (!segment) return Response.json({ error: "Not found" }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "25", 10))

    const filters = segment.filters as unknown as SegmentFilters
    const where = buildSegmentWhere(workspace.id, filters)

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { company: { select: { id: true, name: true } } },
        orderBy: { score: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contact.count({ where }),
    ])

    // Keep segment count fresh
    if (total !== segment.contactCount) {
      void prisma.segment.update({ where: { id }, data: { contactCount: total } }).catch(() => null)
    }

    return Response.json({ data: contacts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (err) {
    console.error("[GET /api/crm/segments/[id]/contacts]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
