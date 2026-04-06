import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <p className="font-display text-[120px] font-bold text-muted-foreground/10 leading-none select-none">
            404
          </p>
        </div>

        <div className="-mt-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Page not found
          </p>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            This page doesn't exist
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you're looking for has been moved, deleted, or never existed.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-foreground bg-foreground text-background px-5 py-2.5 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 border border-border px-5 py-2.5 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
