import type { Metadata } from "next"
import { AgentChat } from "@/components/ai/AgentChat"

export const metadata: Metadata = {
  title: "Zenia AI — AI Marketing Agent",
  description: "Chat with Zenia, your autonomous AI marketing agent. Execute campaigns, generate content, and manage your entire marketing strategy through conversation.",
}

export default function ZeniaAIPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-48px)]">
      <div className="mb-4 shrink-0">
        <div className="h-px w-12 bg-accent mb-3" />
        <h1 className="font-display text-3xl font-medium tracking-tight">Zenia AI</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your autonomous AI marketing agent. Ask anything — it executes.</p>
      </div>
      <div className="flex-1 min-h-0">
        <AgentChat />
      </div>
    </div>
  )
}
