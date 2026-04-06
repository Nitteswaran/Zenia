import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { SignUpForm } from "@/components/auth/SignUpForm"

export const metadata: Metadata = {
  title: "Create Account — Zenia",
  description: "Start your free Zenia account. No credit card required. The AI Marketing Operating System.",
}

export default async function SignupPage() {
  const user = await getAuthUser()
  if (user) redirect("/dashboard")

  return (
    <div className="flex min-h-screen">
      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-muted border-r border-border p-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 bg-accent" />
            <span className="font-display text-xl font-medium tracking-tight">Zenia</span>
          </Link>
        </div>
        <div className="space-y-8">
          <div className="h-px w-16 bg-accent" />
          <h2 className="font-display text-4xl font-medium tracking-tight leading-tight">
            The AI Marketing<br />Operating System
          </h2>
          <div className="space-y-4">
            {[
              { stat: "10×", label: "Faster content creation" },
              { stat: "6+", label: "Tools replaced by one platform" },
              { stat: "40%", label: "Average increase in pipeline" },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline gap-4 border-b border-border pb-4">
                <span className="font-display text-3xl font-medium text-accent">{item.stat}</span>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-mono">© 2025 Zenia. All rights reserved.</p>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-12 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-6 w-6 bg-accent" />
              <span className="font-display text-lg font-medium tracking-tight">Zenia</span>
            </Link>
          </div>

          <div className="space-y-2 mb-8">
            <div className="h-px w-10 bg-accent" />
            <h1 className="font-display text-3xl font-medium tracking-tight">Start for free</h1>
            <p className="text-muted-foreground text-sm">No credit card required. Setup in 2 minutes.</p>
          </div>

          <SignUpForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
