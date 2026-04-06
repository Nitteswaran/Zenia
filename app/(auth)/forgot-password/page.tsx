import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"

export const metadata: Metadata = {
  title: "Reset Password — Zenia",
  description: "Reset your Zenia account password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-6 w-6 bg-accent" />
            <span className="font-display text-lg font-medium tracking-tight">Zenia</span>
          </Link>
          <div className="space-y-2 mt-6">
            <div className="h-px w-10 bg-accent" />
            <h1 className="font-display text-3xl font-medium tracking-tight">Reset password</h1>
            <p className="text-muted-foreground text-sm">Enter your email and we&apos;ll send a reset link.</p>
          </div>
        </div>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
