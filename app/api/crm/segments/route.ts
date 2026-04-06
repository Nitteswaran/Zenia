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

export async function GET(_req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const segments = await prisma.segment.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    })

    return Response.json(segments)
  } catch (err) {
    console.error("[GET /api/crm/segments]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const body = await req.json()
    const parsed = segmentSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, description, filters } = parsed.data

    // Count matching contacts
    const where = buildSegmentWhere(workspace.id, filters as SegmentFilters)
    const contactCount = await prisma.contact.count({ where })

    const segment = await prisma.segment.create({
      data: {
        name,
        description,
        filters: filters as never,
        contactCount,
        workspaceId: workspace.id,
      },
    })

    return Response.json(segment, { status: 201 })
  } catch (err) {
    console.error("[POST /api/crm/segments]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
