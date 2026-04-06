"use client"

import { useQuery } from "@tanstack/react-query"
import { PerformanceChart } from "@/components/analytics/PerformanceChart"
import { useState } from "react"

const RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
]

export default function ContentAnalyticsPage() {
  const [days, setDays] = useState(30)

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-content", days],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/content?days=${days}`)
      if (!res.ok) throw new Error("Failed")
      return res.json() as Promise<{
        byDay: { date: string; generated: number; published: number }[]
        byType: { type: string; count: number }[]
        totalGenerated: number
        totalPublished: number
        creditsUsed: number
      }>
    },
  })

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Analytics</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">Content Analytics</h1>
        </div>
        <div className="flex items-center gap-1 border border-border">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${days === r.days ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="space-y-8">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-px bg-border">
            {[
              { label: "Content Generated", value: data?.totalGenerated ?? 0 },
              { label: "Content Published", value: data?.totalPublished ?? 0 },
              { label: "AI Credits Used", value: data?.creditsUsed ?? 0 },
            ].map((m) => (
              <div key={m.label} className="bg-card p-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{m.label}</p>
                <p className="text-3xl font-display font-bold tracking-tight">{m.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="border border-border p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">Content Over Time</p>
            <PerformanceChart
              data={(data?.byDay ?? []).map((d) => ({ date: d.date, Generated: d.generated, Published: d.published }))}
              type="area"
              metrics={[
                { key: "Generated", label: "Generated", color: "#FF3D00" },
                { key: "Published", label: "Published", color: "#FAFAFA" },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
