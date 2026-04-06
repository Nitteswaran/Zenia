import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import type { AutomationStep, AutomationRunContext } from "@/types"

/**
 * Execute an automation workflow for a given trigger context.
 * Runs all steps sequentially, respects conditions, and logs the run.
 */
export async function runAutomation(
  automationId: string,
  context: Omit<AutomationRunContext, "automationId">
): Promise<void> {
  const automation = await prisma.automation.findUnique({
    where: { id: automationId },
  })

  if (!automation || automation.status !== "ACTIVE") return

  const steps = automation.steps as unknown as AutomationStep[]
  const startedAt = Date.now()
  const output: Record<string, unknown> = {}
  let error: string | undefined

  try {
    for (const step of steps) {
      if (!passesConditions(step, context)) continue
      await executeStep(step, { ...context, automationId }, output)
    }

    await prisma.automationLog.create({
      data: {
        automationId,
        status: "SUCCESS",
        input: context as never,
        output: output as never,
        duration: Date.now() - startedAt,
      },
    })

    await prisma.automation.update({
      where: { id: automationId },
      data: { runCount: { increment: 1 }, lastRunAt: new Date() },
    })
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    console.error(`[Automation ${automationId}] Error:`, err)

    await prisma.automationLog.create({
      data: {
        automationId,
        status: "FAILED",
        input: context as never,
        error,
        duration: Date.now() - startedAt,
      },
    })
  }
}

function passesConditions(step: AutomationStep, context: Record<string, unknown>): boolean {
  if (!step.conditions?.length) return true
  return step.conditions.every((c) => {
    const val = (context as Record<string, unknown>)[c.field]
    switch (c.operator) {
      case "equals": return val === c.value
      case "not_equals": return val !== c.value
      case "contains": return typeof val === "string" && val.includes(String(c.value))
      case "greater_than": return typeof val === "number" && val > Number(c.value)
      case "less_than": return typeof val === "number" && val < Number(c.value)
      default: return true
    }
  })
}

async function executeStep(
  step: AutomationStep,
  context: AutomationRunContext,
  output: Record<string, unknown>
): Promise<void> {
  switch (step.type) {
    case "send_email": {
      const cfg = step.config as { to?: string; subject?: string; html?: string; templateId?: string }
      if (!cfg.to || !cfg.subject) throw new Error(`Step "${step.name}": missing to or subject`)
      // Resolve {{contact.email}} and other template variables
      const resolve = (s: string) =>
        s
          .replace(/\{\{contact\.email\}\}/g, (context.triggerData?.email as string) ?? "")
          .replace(/\{\{contact\.firstName\}\}/g, (context.triggerData?.firstName as string) ?? "")
          .replace(/\{\{contact\.lastName\}\}/g, (context.triggerData?.lastName as string) ?? "")
          .replace(/\{\{deal\.stage\}\}/g, (context.triggerData?.newStage as string) ?? "")
      const to = resolve(cfg.to)
      const subject = resolve(cfg.subject)
      const html = resolve(cfg.html ?? `<p>${cfg.subject}</p>`)
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Zenia <noreply@zenia.ai>",
        to,
        subject,
        html,
      })
      output[step.id] = { sent: true, to }
      break
    }

    case "generate_content": {
      const cfg = step.config as { type?: string; topic?: string; tone?: string }
      if (!cfg.topic) throw new Error(`Step "${step.name}": missing topic`)
      const { buildContentPrompt } = await import("@/lib/ai/prompts")
      const Anthropic = (await import("@anthropic-ai/sdk")).default
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
      const prompt = buildContentPrompt({
        type: cfg.type ?? "SOCIAL_MEDIA",
        topic: cfg.topic,
        tone: cfg.tone ?? "professional",
      })
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      })
      const text = msg.content[0]?.type === "text" ? msg.content[0].text : ""
      await prisma.content.create({
        data: {
          title: cfg.topic.slice(0, 200),
          body: text,
          type: (cfg.type as never) ?? "SOCIAL_MEDIA",
          aiGenerated: true,
          workspaceId: context.workspaceId,
        },
      })
      // Deduct one AI credit
      await prisma.workspace.update({
        where: { id: context.workspaceId },
        data: { aiCreditsUsed: { increment: 1 } },
      })
      output[step.id] = { contentGenerated: true }
      break
    }

    case "schedule_post": {
      const cfg = step.config as {
        caption?: string
        platform?: string
        scheduledAt?: string
        socialAccountId?: string
      }
      if (!cfg.caption || !cfg.platform || !cfg.scheduledAt) {
        throw new Error(`Step "${step.name}": missing caption, platform, or scheduledAt`)
      }
      const post = await prisma.socialPost.create({
        data: {
          caption: cfg.caption,
          platform: cfg.platform as never,
          scheduledAt: new Date(cfg.scheduledAt),
          status: "SCHEDULED",
          workspaceId: context.workspaceId,
          socialAccountId: cfg.socialAccountId ?? null,
        },
      })
      output[step.id] = { postId: post.id }
      break
    }

    case "add_contact": {
      const cfg = step.config as { email?: string; firstName?: string; lastName?: string }
      if (!cfg.email) throw new Error(`Step "${step.name}": missing email`)
      await prisma.contact.upsert({
        where: { workspaceId_email: { workspaceId: context.workspaceId, email: cfg.email } },
        create: {
          email: cfg.email,
          firstName: cfg.firstName,
          lastName: cfg.lastName,
          workspaceId: context.workspaceId,
        },
        update: {},
      })
      output[step.id] = { contactUpserted: true }
      break
    }

    case "create_deal": {
      const cfg = step.config as { title?: string; value?: number; stage?: string }
      if (!cfg.title) throw new Error(`Step "${step.name}": missing title`)
      const deal = await prisma.deal.create({
        data: {
          title: cfg.title,
          value: cfg.value ?? 0,
          stage: (cfg.stage as never) ?? "LEAD",
          workspaceId: context.workspaceId,
          contactId: context.contactId ?? null,
        },
      })
      output[step.id] = { dealId: deal.id }
      break
    }

    case "send_slack": {
      const cfg = step.config as { webhookUrl?: string; message?: string }
      if (!cfg.webhookUrl || !cfg.message) throw new Error(`Step "${step.name}": missing webhookUrl or message`)
      const res = await fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cfg.message }),
      })
      if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`)
      output[step.id] = { slackSent: true }
      break
    }

    case "webhook": {
      const cfg = step.config as { url?: string; method?: string; headers?: Record<string, string>; body?: unknown }
      if (!cfg.url) throw new Error(`Step "${step.name}": missing url`)
      const res = await fetch(cfg.url, {
        method: cfg.method ?? "POST",
        headers: { "Content-Type": "application/json", ...(cfg.headers ?? {}) },
        body: JSON.stringify(cfg.body ?? context),
      })
      output[step.id] = { status: res.status, ok: res.ok }
      break
    }

    case "add_tag": {
      const cfg = step.config as { tag?: string }
      if (!cfg.tag || !context.contactId) break
      await prisma.contact.update({
        where: { id: context.contactId },
        data: { tags: { push: cfg.tag } },
      })
      output[step.id] = { tagAdded: cfg.tag }
      break
    }

    case "wait": {
      const cfg = step.config as { duration?: number; unit?: "seconds" | "minutes" | "hours" }
      const ms =
        (cfg.duration ?? 0) *
        (cfg.unit === "hours" ? 3_600_000 : cfg.unit === "minutes" ? 60_000 : 1_000)
      if (ms > 0 && ms <= 30_000) {
        await new Promise((r) => setTimeout(r, ms))
      }
      // For longer waits, the caller should re-enqueue via QStash
      output[step.id] = { waited: true }
      break
    }

    default:
      console.warn(`[Automation] Unknown step type: ${(step as { type: string }).type}`)
  }
}
