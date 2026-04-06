import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const workspaceUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
  logoUrl: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  timezone: z.string().max(50).optional(),
})

async function getWorkspaceWithRole(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: {
      workspaceMembers: {
        include: { workspace: true },
        take: 1,
      },
    },
  })
  const member = dbUser?.workspaceMembers[0]
  return { workspace: member?.workspace ?? null, role: member?.role ?? null }
}

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { workspace } = await getWorkspaceWithRole(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    return Response.json(workspace)
  } catch (err) {
    console.error("[GET /api/settings/workspace]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { workspace, role } = await getWorkspaceWithRole(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })
    if (role !== "OWNER" && role !== "ADMIN") {
      return Response.json({ error: "Only owners and admins can update workspace settings" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = workspaceUpdateSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    // Check slug uniqueness if changing
    if (parsed.data.slug && parsed.data.slug !== workspace.slug) {
      const existing = await prisma.workspace.findUnique({ where: { slug: parsed.data.slug } })
      if (existing) return Response.json({ error: "Slug already taken" }, { status: 409 })
    }

    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data: parsed.data,
    })

    return Response.json(updated)
  } catch (err) {
    console.error("[PATCH /api/settings/workspace]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { workspace, role } = await getWorkspaceWithRole(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })
    if (role !== "OWNER") {
      return Response.json({ error: "Only the owner can delete the workspace" }, { status: 403 })
    }

    await prisma.workspace.delete({ where: { id: workspace.id } })

    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("[DELETE /api/settings/workspace]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
