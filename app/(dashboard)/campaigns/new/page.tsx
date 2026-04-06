import type { Metadata } from "next"
import { CampaignWizard } from "@/components/ai/CampaignWizard"

export const metadata: Metadata = {
  title: "New Campaign — Zenia",
  description: "Create a new AI-powered marketing campaign.",
}

export default function NewCampaignPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <div className="h-px w-12 bg-accent mb-3" />
        <h1 className="font-display text-3xl font-medium tracking-tight">New Campaign</h1>
        <p className="text-muted-foreground mt-1 text-sm">AI will generate your campaign strategy, content calendar, and KPIs.</p>
      </div>
      <CampaignWizard />
    </div>
  )
}
