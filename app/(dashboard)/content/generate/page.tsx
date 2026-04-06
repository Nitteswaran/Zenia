import type { Metadata } from "next"
import { ContentGenerator } from "@/components/ai/ContentGenerator"

export const metadata: Metadata = {
  title: "Generate Content — Zenia AI",
  description: "AI-powered content generator for every platform and format.",
}

export default function GenerateContentPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-px w-12 bg-accent mb-3" />
        <h1 className="font-display text-3xl font-medium tracking-tight">AI Content Generator</h1>
        <p className="text-muted-foreground mt-1 text-sm">Generate any content type for any platform. Powered by Claude.</p>
      </div>
      <ContentGenerator />
    </div>
  )
}
