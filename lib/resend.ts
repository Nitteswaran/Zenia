import { Resend } from "resend"

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export const resend = new Resend(requiredEnv("RESEND_API_KEY"))

export const resendFromEmail = process.env.RESEND_FROM_EMAIL
export const resendFromName = process.env.RESEND_FROM_NAME

