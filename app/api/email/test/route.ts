import { NextRequest } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/supabase/server"
import { getResend, resendFromEmail, resendFromName } from "@/lib/resend"

export const runtime = "nodejs"

const requestSchema = z.object({
  to: z.string().email().optional(),
  subject: z.string().min(1).max(200).optional(),
  html: z.string().min(1).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return new Response("Unauthorized", { status: 401 })

    const json = await req.json().catch(() => ({}))
    const parsed = requestSchema.safeParse(json)
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const to = parsed.data.to ?? authUser.email ?? undefined
    if (!to) return Response.json({ error: "Missing recipient email" }, { status: 400 })

    const fromEmail = resendFromEmail ?? "onboarding@resend.dev"
    const fromName = resendFromName?.trim()
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail

    const result = await getResend().emails.send({
      from,
      to,
      subject: parsed.data.subject ?? "Hello World",
      html: parsed.data.html ?? "<p>Congrats on sending your <strong>first email</strong>!</p>",
    })

    return Response.json({ ok: true, result })
  } catch (error) {
    console.error("[Resend Test Email Error]", error)
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 })
  }
}

