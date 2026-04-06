import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { fireTrigger } from "@/lib/automation/trigger"

/**
 * Called by a scheduled cron (e.g. daily via Vercel Cron or QStash).
 * Finds all ACTIVE automations with trigger type "crm_inactivity" and fires
 * them for contacts that match the inactivity threshold.
 *
 * Protect with CRON_SECRET header.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find all active automations with crm_inactivity trigger
    const automations = await prisma.automation.findMany({
      where: { status: "ACTIVE" },
      include: { workspace: { select: { id: true } } },
    })

    const inactivityAutomations = automations.filter((a) => {
      const trigger = a.trigger as { type: string; config?: { inactiveDays?: number } }
      return trigger.type === "crm_inactivity"
    })

    if (inactivityAutomations.length === 0) {
      return Response.json({ checked: 0, fired: 0 })
    }

    let totalFired = 0

    for (const auto of inactivityAutomations) {
      const trigger = auto.trigger as { type: string; config?: { inactiveDays?: number } }
      const inactiveDays = trigger.config?.inactiveDays ?? 30
      const cutoff = new Date(Date.now() - inactiveDays * 86_400_000)

      // Find contacts in this workspace that have been inactive
      const inactiveContacts = await prisma.contact.findMany({
        where: {
          workspaceId: auto.workspace.id,
          status: { notIn: ["CUSTOMER", "CHURNED", "UNQUALIFIED"] },
          OR: [
            { lastInteractionAt: { lte: cutoff } },
            { lastInteractionAt: null, createdAt: { lte: cutoff } },
          ],
        },
        select: { id: true, email: true, firstName: true },
        take: 100, // batch limit per run
      })

      for (const contact of inactiveContacts) {
        void fireTrigger(auto.workspace.id, "crm_inactivity", {
          contactId: contact.id,
          triggerData: {
            email: contact.email,
            firstName: contact.firstName,
            inactiveDays,
          },
        })
        totalFired++
      }
    }

    return Response.json({ checked: inactivityAutomations.length, fired: totalFired })
  } catch (err) {
    console.error("[POST /api/crm/inactivity-check]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
