import { NextRequest } from "next/server"

// Resend webhook handler
// Events: email.sent, email.delivered, email.delivery_delayed, email.complained, email.bounced, email.opened, email.clicked
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("svix-signature")
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const svixId = req.headers.get("svix-id") ?? ""
      const svixTimestamp = req.headers.get("svix-timestamp") ?? ""
      const body = await req.text()

      // Basic HMAC verification using Web Crypto
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      )

      const signedContent = `${svixId}.${svixTimestamp}.${body}`
      const expectedSig = signature.split(" ").find((s) => s.startsWith("v1,"))?.replace("v1,", "")

      if (expectedSig) {
        const sigBuffer = Buffer.from(expectedSig, "base64")
        const valid = await crypto.subtle.verify("HMAC", key, sigBuffer, encoder.encode(signedContent))
        if (!valid) {
          return Response.json({ error: "Invalid signature" }, { status: 401 })
        }
      }

      const event = JSON.parse(body) as { type: string; data: Record<string, unknown> }
      await handleResendEvent(event)
    } else {
      const event = await req.json() as { type: string; data: Record<string, unknown> }
      await handleResendEvent(event)
    }

    return Response.json({ received: true })
  } catch (err) {
    console.error("[POST /api/webhooks/resend]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleResendEvent(event: { type: string; data: Record<string, unknown> }) {
  switch (event.type) {
    case "email.bounced":
      console.log("[Resend] Email bounced:", event.data.to)
      break
    case "email.complained":
      console.log("[Resend] Spam complaint:", event.data.to)
      break
    case "email.delivered":
      console.log("[Resend] Email delivered:", event.data.to)
      break
    default:
      // Other events (opened, clicked, etc.) — log for now
      console.log("[Resend] Event:", event.type, event.data.to)
  }
}
