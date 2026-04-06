import { Resend } from "resend"

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("Missing environment variable: RESEND_API_KEY")
  return new Resend(key)
}

export const resendFromEmail = process.env.RESEND_FROM_EMAIL
export const resendFromName = process.env.RESEND_FROM_NAME

