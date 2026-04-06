"use client"

import { useState } from "react"
import { Sparkles, RefreshCw, TrendingUp, Target, Users, BarChart2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import useSWR, { mutate } from "swr"
import type { CrmInsightData } from "@/types"

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  engagement: { icon: TrendingUp, color: "text-blue-400" },
  conversion: { icon: Target, color: "text-green-400" },
  segment: { icon: Users, color: "text-purple-400" },
  pipeline: { icon: BarChart2, color: "text-accent" },
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CrmInsightsPanel() {
  const { toast } = useToast()
  const [regenerating, setRegenerating] = useState(false)

  const { data: insights, isLoading, error } = useSWR<CrmInsightData[]>(
    "/api/crm/insights",
    fetcher,
    { revalidateOnFocus: false }
  )

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const res = await fetch("/api/crm/insights", { method: "POST" })
      if (!res.ok) throw new Error("Failed")
      await mutate("/api/crm/insights")
      toast({ title: "Insights refreshed" })
    } catch {
      toast({ title: "Failed to regenerate insights", variant: "destructive" })
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
          <span className="text-xs font-mono uppercase tracking-wider">AI CRM Insights</span>
        </div>
        <button
          onClick={() => void handleRegenerate()}
          disabled={regenerating || isLoading}
          className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("h-3 w-3", regenerating && "animate-spin")} strokeWidth={1.5} />
          Refresh (1 credit)
        </button>
      </div>

      <div className="p-4">
        {isLoading || regenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" strokeWidth={1.5} />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground text-center py-6">Failed to load insights</p>
        ) : !insights || insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground mb-2" strokeWidth={1} />
            <p className="text-sm text-muted-foreground mb-3">No insights generated yet</p>
            <button
              onClick={() => void handleRegenerate()}
              className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
              Generate Insights (1 credit)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => {
              const config = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.pipeline
              const Icon = config.icon
              return (
                <div key={insight.id} className="flex gap-3 p-3 border border-border/50 hover:border-border transition-colors">
                  <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", config.color)} strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium leading-snug">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
