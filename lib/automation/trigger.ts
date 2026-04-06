import { prisma } from "@/lib/prisma"
import { runAutomation } from "./engine"
import type { AutomationRunContext } from "@/types"

/**
 * Find all ACTIVE automations for a workspace matching the given trigger type
 * and run them non-blocking. Safe to call fire-and-forget with `void`.
 */
export async function fireTrigger(
  workspaceId: string,
  triggerType: string,
  context: Omit<AutomationRunContext, "automationId" | "workspaceId">
): Promise<void> {
  try {
    const automations = await prisma.automation.findMany({
      where: { workspaceId, status: "ACTIVE" },
    })

    const matching = automations.filter((a) => {
      const trigger = a.trigger as { type: string }
      return trigger.type === triggerType
    })

    await Promise.all(
      matching.map((a) =>
        runAutomation(a.id, { workspaceId, ...context }).catch((err) =>
          console.error(`[fireTrigger] automation ${a.id} failed:`, err)
        )
      )
    )
  } catch (err) {
    console.error(`[fireTrigger] ${triggerType}:`, err)
  }
}
