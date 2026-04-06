import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { runAutomation } from "@/lib/automation/engine"
import { z } from "zod"

export const runtime = "nodejs"

const triggerSchema = z.object({
  triggerType: z.string().min(1),
  workspaceId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  triggerData: z.record(z.unknown()).optional().default({}),
})

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
    const parsed = triggerSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const { triggerType, contactId, dealId, triggerData } = parsed.data

    // Find all active automations for this workspace with matching trigger
    const automations = await prisma.automation.findMany({
      where: { workspaceId: workspace.id, status: "ACTIVE" },
    })

    const matching = automations.filter((a) => {
      const trigger = a.trigger as { type: string }
      return trigger.type === triggerType
    })

    // Fire all matching automations (non-blocking — respond first)
    const runPromises = matching.map((a) =>
      runAutomation(a.id, {
        workspaceId: workspace.id,
        triggerData: triggerData ?? {},
        contactId,
        dealId,
      }).catch((err) => console.error(`[Automation trigger] ${a.id}:`, err))
    )

    // Run async; don't block the response
    void Promise.all(runPromises)

    return Response.json({ triggered: matching.length })
  } catch (err) {
    console.error("[POST /api/automation/trigger]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
