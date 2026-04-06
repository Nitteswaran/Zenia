"use client"

import { useQuery } from "@tanstack/react-query"
import { PlatformBreakdown } from "@/components/analytics/PlatformBreakdown"
import { PerformanceChart } from "@/components/analytics/PerformanceChart"
import { useState } from "react"

const RANGES = [{ label: "7D", days: 7 }, { label: "30D", days: 30 }, { label: "90D", days: 90 }]

export default function SocialAnalyticsPage() {
  const [days, setDays] = useState(30)

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-social", days],
    queryFn: async () => {
      const res = await fetch(`/api/social/analytics?days=${days}`)
      if (!res.ok) throw new Error("Failed")
      return res.json() as Promise<{
        byPlatform: Record<string, { posts: number; impressions: number; engagements: number; reach: number }>
        totalPosts: number
      }>
    },
  })

  const breakdown = Object.entries(data?.byPlatform ?? {}).map(([platform, m]) => ({
    platform,
    value: m.posts,
  }))

  const totalImpressions = Object.values(data?.byPlatform ?? {}).reduce((s, m) => s + m.impressions, 0)
  const totalEngagements = Object.values(data?.byPlatform ?? {}).reduce((s, m) => s + m.engagements, 0)

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Analytics</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">Social Analytics</h1>
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
          <div className="grid grid-cols-3 gap-px bg-border">
            {[
              { label: "Posts Published", value: data?.totalPosts ?? 0 },
              { label: "Total Impressions", value: totalImpressions },
              { label: "Total Engagements", value: totalEngagements },
            ].map((m) => (
              <div key={m.label} className="bg-card p-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{m.label}</p>
                <p className="text-3xl font-display font-bold tracking-tight">{m.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">Posts by Platform</p>
              <PlatformBreakdown data={breakdown} />
            </div>
            <div className="border border-border p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">Platform Breakdown</p>
              <div className="space-y-3">
                {Object.entries(data?.byPlatform ?? {}).map(([platform, m]) => (
                  <div key={platform} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">{platform}</span>
                    <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
                      <span>{m.posts} posts</span>
                      <span>{m.impressions.toLocaleString()} impr.</span>
                    </div>
                  </div>
                ))}
                {!Object.keys(data?.byPlatform ?? {}).length && (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
