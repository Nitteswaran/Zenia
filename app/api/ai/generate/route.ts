import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { buildContentPrompt } from "@/lib/ai/prompts"
import { contentGenerateSchema } from "@/lib/validations/schemas"
import { resolveContentModel } from "@/lib/ai/models"
import { streamModel } from "@/lib/ai/client"
import { checkAIRateLimit, rateLimitHeaders } from "@/lib/ai/rate-limit"
import type { Plan } from "@prisma/client"
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
      return Response.json({ error: "AI credits exhausted. Please upgrade." }, { status: 402 })
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

    // ── Input validation ─────────────────────────────────────────────────────
    const body = await req.json()
    const parsed = contentGenerateSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // ── Model selection ───────────────────────────────────────────────────────
    const modelConfig = resolveContentModel({
      contentType: data.type,
      language: data.language ?? "en",
    })

    // Check we have enough credits for this model's cost
    const remainingCredits = workspace.aiCreditsLimit - workspace.aiCreditsUsed
    if (remainingCredits < modelConfig.creditCost) {
      return Response.json(
        { error: `This task requires ${modelConfig.creditCost} credits but you only have ${remainingCredits} remaining. Please upgrade.` },
        { status: 402 }
      )
    }

    const prompt = buildContentPrompt({
      type: data.type,
      platform: data.platform,
      topic: data.topic,
      tone: data.tone,
      audience: data.audience,
      keywords: data.keywords,
      length: data.length,
      additionalContext: data.additionalContext ?? "",
    })

    // ── Stream ───────────────────────────────────────────────────────────────
    const encoder = new TextEncoder()
    let generatedText = ""

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Emit model info so the client can show which model is being used
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ model: modelConfig.label, tier: modelConfig.tier })}\n\n`
            )
          )

          const generator = streamModel({
            config: modelConfig,
            messages: [{ role: "user", content: prompt }],
          })

          for await (const chunk of generator) {
            if (chunk === "data: [DONE]\n\n") break
            // Extract text from normalized chunk and accumulate
            try {
              const parsed = JSON.parse(chunk.replace("data: ", "")) as { text?: string }
              if (parsed.text) generatedText += parsed.text
            } catch { /* ignore parse errors */ }
            controller.enqueue(encoder.encode(chunk))
          }

          // ── Post-generation: persist + deduct credits ─────────────────────
          await prisma.$transaction([
            prisma.content.create({
              data: {
                title: data.topic.slice(0, 200),
                body: generatedText,
                type: data.type as never,
                platform: data.platform as never,
                language: data.language ?? "en",
                aiGenerated: true,
                tags: data.keywords ?? [],
                workspaceId: workspace.id,
              },
            }),
            prisma.workspace.update({
              where: { id: workspace.id },
              data: { aiCreditsUsed: { increment: modelConfig.creditCost } },
            }),
          ])

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (err) {
          console.error("[AI Generate Stream Error]", err)
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Generation failed" })}\n\n`
              )
            )
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          } catch { /* stream may already be closed */ }
          controller.close()
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
    console.error("[AI Generate Error]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
