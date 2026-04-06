"use client"

import { useState } from "react"
import { Loader2, RefreshCw, Flame, Snowflake, ThermometerSun } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScoreSummary {
  updated: number
  summary: { hot: number; warm: number; cold: number }
}

export function LeadScoreActions() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoreSummary | null>(null)

  async function handleRecalculate() {
    setLoading(true)
    try {
      const res = await fetch("/api/crm/lead-score/recalculate", { method: "POST" })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json() as ScoreSummary
      setResult(data)
      toast({ title: `Lead scores updated for ${data.updated} contacts` })
    } catch {
      toast({ title: "Failed to recalculate scores", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-border bg-card p-4 flex items-center justify-between gap-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Lead Score Engine</p>
        <p className="text-sm text-muted-foreground">
          Scores are calculated from profile completeness, status, deal activity, and interaction recency.
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {result && (
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-green-400">
              <Flame className="h-3.5 w-3.5" strokeWidth={1.5} />
              {result.summary.hot} hot
            </span>
            <span className="flex items-center gap-1.5 text-yellow-400">
              <ThermometerSun className="h-3.5 w-3.5" strokeWidth={1.5} />
              {result.summary.warm} warm
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Snowflake className="h-3.5 w-3.5" strokeWidth={1.5} />
              {result.summary.cold} cold
            </span>
          </div>
        )}
        <button
          onClick={() => void handleRecalculate()}
          disabled={loading}
          className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
            : <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />}
          {loading ? "Scoring…" : "Recalculate All Scores"}
        </button>
      </div>
    </div>
  )
}
