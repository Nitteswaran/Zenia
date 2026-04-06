import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { fireTrigger } from "@/lib/automation/trigger"

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  body: z.string().optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  tags: z.array(z.string()).optional(),
})

async function getWorkspace(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  return dbUser?.workspaceMembers[0]?.workspace ?? null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspace(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const { id } = await params

    const content = await prisma.content.findFirst({
      where: { id, workspaceId: workspace.id },
      include: {
        campaign: { select: { id: true, name: true } },
        socialPosts: { select: { id: true, platform: true, status: true, publishedAt: true } },
      },
    })

    if (!content) return Response.json({ error: "Not found" }, { status: 404 })

    return Response.json(content)
  } catch (err) {
    console.error("[GET /api/content/[id]]", err)
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
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    // Check previous status to detect publish event
    const existing = parsed.data.status === "PUBLISHED"
      ? await prisma.content.findFirst({ where: { id, workspaceId: workspace.id }, select: { id: true, status: true, title: true } })
      : null

    const updated = await prisma.content.updateMany({
      where: { id, workspaceId: workspace.id },
      data: parsed.data,
    })

    if (updated.count === 0) return Response.json({ error: "Not found" }, { status: 404 })

    const content = await prisma.content.findUnique({ where: { id } })

    // Fire trigger if content was just published
    if (existing && existing.status !== "PUBLISHED" && parsed.data.status === "PUBLISHED") {
      void fireTrigger(workspace.id, "content_published", {
        triggerData: { contentId: id, title: existing.title },
      })
    }

    return Response.json(content)
  } catch (err) {
    console.error("[PATCH /api/content/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
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

    const deleted = await prisma.content.deleteMany({
      where: { id, workspaceId: workspace.id },
    })

    if (deleted.count === 0) return Response.json({ error: "Not found" }, { status: 404 })

    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("[DELETE /api/content/[id]]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
