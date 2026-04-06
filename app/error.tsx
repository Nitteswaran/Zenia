"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking (PostHog, Sentry, etc.)
    console.error("[Global Error Boundary]", error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 border border-accent/40 bg-accent/5 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-accent" strokeWidth={1.5} />
            </div>
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Unexpected Error
            </p>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Something went wrong</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An unexpected error occurred. Our team has been notified. You can try again or return to the dashboard.
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-muted-foreground mt-3">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 border border-border px-5 py-2.5 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
              Try again
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 border border-foreground bg-foreground text-background px-5 py-2.5 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              <Home className="h-3.5 w-3.5" strokeWidth={1.5} />
              Dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
