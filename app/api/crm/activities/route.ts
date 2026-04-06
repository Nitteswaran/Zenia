import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createActivitySchema = z.object({
  type: z.enum(["NOTE", "CALL", "EMAIL", "MEETING", "TASK"]),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

async function getWorkspaceFromAuth(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  return dbUser?.workspaceMembers[0]?.workspace ?? null
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspaceFromAuth(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const body = await req.json()
    const parsed = createActivitySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    // Verify contact/deal belong to workspace
    if (parsed.data.contactId) {
      const c = await prisma.contact.findFirst({
        where: { id: parsed.data.contactId, workspaceId: workspace.id },
        select: { id: true },
      })
      if (!c) return Response.json({ error: "Contact not found" }, { status: 404 })
    }

    const activity = await prisma.activity.create({
      data: {
        type: parsed.data.type,
        title: parsed.data.title,
        description: parsed.data.description || null,
        contactId: parsed.data.contactId,
        dealId: parsed.data.dealId,
        metadata: (parsed.data.metadata ?? {}) as never,
      },
    })

    // Update lastInteractionAt on the contact
    if (parsed.data.contactId) {
      void prisma.contact
        .update({
          where: { id: parsed.data.contactId },
          data: { lastInteractionAt: new Date() },
        })
        .catch(() => null)
    }

    return Response.json(activity, { status: 201 })
  } catch (err) {
    console.error("[POST /api/crm/activities]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
