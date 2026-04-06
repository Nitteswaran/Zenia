import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { ZENIA_SYSTEM_PROMPT } from "@/lib/ai/prompts"
import { AGENT_MODEL } from "@/lib/ai/models"
import { streamModel } from "@/lib/ai/client"
import { checkAIRateLimit, rateLimitHeaders } from "@/lib/ai/rate-limit"
import type { PlanKey } from "@/lib/plan-limits"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return new Response("Unauthorized", { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return new Response("Workspace not found", { status: 404 })

    // ── Credit gate ─────────────────────────────────────────────────────────
    if (workspace.aiCreditsUsed >= workspace.aiCreditsLimit) {
      return Response.json({ error: "AI credits exhausted. Please upgrade your plan." }, { status: 402 })
    }

    // ── Rate limit gate ──────────────────────────────────────────────────────
    const rl = await checkAIRateLimit(workspace.id, workspace.plan as PlanKey)
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "AI rate limit exceeded. Slow down or upgrade your plan." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rl.reset
              ? String(Math.ceil((rl.reset - Date.now()) / 1000))
              : "60",
            ...rateLimitHeaders(rl),
          },
        }
      )
    }

    const { messages } = await req.json() as {
      messages: Array<{ role: "user" | "assistant"; content: string }>
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "messages array is required" }, { status: 400 })
    }

    // Agent always uses Claude Sonnet — best reasoning + tool use
    const modelConfig = AGENT_MODEL

    // ── Stream ───────────────────────────────────────────────────────────────
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = streamModel({
            config: modelConfig,
            system: ZENIA_SYSTEM_PROMPT,
            messages,
          })

          for await (const chunk of generator) {
            if (chunk === "data: [DONE]\n\n") break
            controller.enqueue(encoder.encode(chunk))
          }

          // Deduct 1 credit per agent turn
          await prisma.workspace.update({
            where: { id: workspace.id },
            data: { aiCreditsUsed: { increment: 1 } },
          })

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (err) {
          console.error("[AI Agent Stream Error]", err)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Agent failed" })}\n\n`
            )
          )
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-AI-Model": modelConfig.label,
        "X-AI-Tier": modelConfig.tier,
        ...rateLimitHeaders(rl),
      },
    })
  } catch (error) {
    console.error("[AI Agent Error]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
