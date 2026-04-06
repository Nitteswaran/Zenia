import type { Metadata } from "next"
import { AnalyticsOverview } from "@/components/analytics/MetricsGrid"

export const metadata: Metadata = { title: "Analytics — Zenia", description: "Full analytics dashboard for content, social, campaigns, and CRM." }

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-px w-12 bg-accent mb-3" />
        <h1 className="font-display text-3xl font-medium tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Track performance across all channels and campaigns.</p>
      </div>
      <AnalyticsOverview />
    </div>
  )
}
