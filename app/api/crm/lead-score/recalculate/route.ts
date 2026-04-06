import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { calculateLeadScore } from "@/lib/crm/lead-scorer"
import { fireTrigger } from "@/lib/automation/trigger"

export const runtime = "nodejs"
export const maxDuration = 60 // allow up to 60s for large workspaces

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

    const body = (await req.json().catch(() => ({}))) as { contactId?: string }
    const singleId = body.contactId

    // Fetch contacts with deals + activities for scoring
    const contacts = await prisma.contact.findMany({
      where: singleId
        ? { id: singleId, workspaceId: workspace.id }
        : { workspaceId: workspace.id },
      include: {
        deals: true,
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    })

    const results = []
    const scoresToCheck: { id: string; oldScore: number; newScore: number }[] = []

    for (const contact of contacts) {
      const result = calculateLeadScore(contact)
      scoresToCheck.push({ id: contact.id, oldScore: contact.score, newScore: result.score })
      results.push(result)

      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          score: result.score,
          scoreLabel: result.label,
          lastInteractionAt: contact.activities[0]?.createdAt ?? contact.lastInteractionAt,
        },
      })
    }

    // Fire lead_score_threshold trigger for contacts that crossed 65 (hot threshold)
    for (const { id, oldScore, newScore } of scoresToCheck) {
      if (oldScore < 65 && newScore >= 65) {
        void fireTrigger(workspace.id, "lead_score_threshold", {
          contactId: id,
          triggerData: { previousScore: oldScore, newScore, label: "hot" },
        })
      }
    }

    return Response.json({
      updated: results.length,
      results: singleId ? results : undefined,
      summary: singleId ? undefined : {
        hot: results.filter((r) => r.label === "hot").length,
        warm: results.filter((r) => r.label === "warm").length,
        cold: results.filter((r) => r.label === "cold").length,
      },
    })
  } catch (err) {
    console.error("[POST /api/crm/lead-score/recalculate]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
