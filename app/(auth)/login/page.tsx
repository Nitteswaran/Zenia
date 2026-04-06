import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "Sign In — Zenia",
  description: "Sign in to your Zenia account and access your AI Marketing Operating System.",
}

export default async function LoginPage() {
  const user = await getAuthUser()
  if (user) redirect("/dashboard")

  return (
    <div className="flex min-h-screen">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-muted border-r border-border p-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 bg-accent" />
            <span className="font-display text-xl font-medium tracking-tight">Zenia</span>
          </Link>
        </div>
        <div className="space-y-6">
          <div className="h-px w-16 bg-accent" />
          <blockquote className="font-display text-3xl font-medium tracking-tight leading-tight">
            &ldquo;Zenia replaced 6 tools and saved us 20 hours a week. The AI actually executes — it doesn&rsquo;t just advise.&rdquo;
          </blockquote>
          <div>
            <p className="font-semibold text-sm">Sarah Chen</p>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Head of Marketing, Vertex Labs</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-mono">© 2025 Zenia. All rights reserved.</p>
      </div>

      {/* Right Auth Panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-6 w-6 bg-accent" />
              <span className="font-display text-lg font-medium tracking-tight">Zenia</span>
            </Link>
          </div>

          <div className="space-y-2 mb-8">
            <div className="h-px w-10 bg-accent" />
            <h1 className="font-display text-3xl font-medium tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your AI marketing command centre.</p>
          </div>

          <LoginForm />

          <div className="mt-6 space-y-3 text-center text-sm">
            <Link
              href="/forgot-password"
              className="block text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Forgot your password?
            </Link>
            <p className="text-muted-foreground">
              No account?{" "}
              <Link href="/signup" className="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">
                Start for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
