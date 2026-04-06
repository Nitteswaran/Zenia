import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import type { SalesAssistantSuggestion } from "@/types"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const bodySchema = z.object({
  contactId: z.string().min(1),
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
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "contactId is required" }, { status: 400 })
    }

    const contact = await prisma.contact.findFirst({
      where: { id: parsed.data.contactId, workspaceId: workspace.id },
      include: {
        company: { select: { name: true, industry: true, size: true } },
        deals: {
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: { title: true, stage: true, value: true, probability: true, updatedAt: true },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { type: true, title: true, description: true, createdAt: true },
        },
      },
    })

    if (!contact) return Response.json({ error: "Contact not found" }, { status: 404 })

    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.email
    const daysSinceLastActivity = contact.lastInteractionAt
      ? Math.floor((Date.now() - new Date(contact.lastInteractionAt).getTime()) / 86_400_000)
      : null

    const prompt = `You are an expert B2B sales coach. Analyze this contact and provide the 3 most impactful next actions.

CONTACT:
- Name: ${fullName}
- Email: ${contact.email}
- Title: ${contact.title ?? "unknown"}
- Status: ${contact.status}
- Lead Score: ${contact.score}/100 (${contact.scoreLabel ?? "unscored"})
- Tags: ${contact.tags.join(", ") || "none"}
- Source: ${contact.source ?? "unknown"}
- Company: ${contact.company?.name ?? "unknown"} (${contact.company?.industry ?? "unknown industry"}, ${contact.company?.size ?? "unknown size"})
- Days since last interaction: ${daysSinceLastActivity ?? "never interacted"}

DEALS (${contact.deals.length}):
${contact.deals.map((d) => `- "${d.title}" — stage: ${d.stage}, value: $${d.value}, probability: ${d.probability}%`).join("\n") || "- No deals"}

RECENT ACTIVITIES (last ${contact.activities.length}):
${contact.activities.map((a) => `- [${a.type}] ${a.title} (${new Date(a.createdAt).toLocaleDateString()})`).join("\n") || "- No activities"}

Return exactly a JSON array of 3 suggestions (no markdown, raw JSON):
[
  {
    "action": "specific action to take (max 8 words)",
    "rationale": "1-2 sentences explaining why this is the right next step",
    "priority": "high|medium|low",
    "suggestedMessage": "optional short message or talking points (2-3 sentences, only if relevant)"
  }
]

Prioritize the most impactful action first. Be specific to this contact's situation.`

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = message.content[0]?.type === "text" ? message.content[0].text.trim() : "[]"

    let suggestions: SalesAssistantSuggestion[] = []
    try {
      suggestions = JSON.parse(raw) as SalesAssistantSuggestion[]
    } catch {
      return Response.json({ error: "AI returned invalid JSON" }, { status: 500 })
    }

    // Deduct 1 AI credit
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { aiCreditsUsed: { increment: 1 } },
    })

    return Response.json(suggestions)
  } catch (err) {
    console.error("[POST /api/crm/assistant/suggest]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
