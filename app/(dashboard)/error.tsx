"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Dashboard Error Boundary]", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-14 w-14 border border-accent/40 bg-accent/5 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-accent" strokeWidth={1.5} />
          </div>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Page Error
          </p>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Failed to load this page</h2>
          <p className="text-sm text-muted-foreground">
            {error.message && error.message !== "Internal server error"
              ? error.message
              : "Something went wrong loading this section. Try refreshing or going back."}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground mt-2">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Retry
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
