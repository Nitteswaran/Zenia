"use client"

import { useState } from "react"
import { BrainCircuit, Loader2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { SalesAssistantSuggestion } from "@/types"

const PRIORITY_CONFIG = {
  high: { label: "HIGH", className: "border-accent/50 text-accent bg-accent/5" },
  medium: { label: "MED", className: "border-yellow-500/50 text-yellow-400 bg-yellow-500/5" },
  low: { label: "LOW", className: "border-border text-muted-foreground" },
}

interface SalesAssistantPanelProps {
  contactId: string
}

export function SalesAssistantPanel({ contactId }: SalesAssistantPanelProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<SalesAssistantSuggestion[] | null>(null)
  const [expanded, setExpanded] = useState<number | null>(0)
  const [copied, setCopied] = useState<number | null>(null)

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch("/api/crm/assistant/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      })
      if (!res.ok) throw new Error("Failed to generate suggestions")
      const data = await res.json() as SalesAssistantSuggestion[]
      setSuggestions(data)
    } catch {
      toast({ title: "Failed to generate suggestions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function copyMessage(msg: string, idx: number) {
    await navigator.clipboard.writeText(msg)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">AI Sales Assistant</p>

      {!suggestions && !loading && (
        <button
          onClick={() => void handleGenerate()}
          className="flex items-center gap-2 border border-border px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors w-full justify-center"
        >
          <BrainCircuit className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
          Suggest Next Actions (1 credit)
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" strokeWidth={1.5} />
        </div>
      )}

      {suggestions && (
        <div className="space-y-2">
          {suggestions.map((s, i) => {
            const priority = PRIORITY_CONFIG[s.priority] ?? PRIORITY_CONFIG.medium
            const isOpen = expanded === i
            return (
              <div key={i} className="border border-border">
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/20 transition-colors"
                >
                  <span className={cn("shrink-0 px-1.5 py-0.5 text-[9px] font-mono font-bold border mt-0.5", priority.className)}>
                    {priority.label}
                  </span>
                  <span className="flex-1 text-sm font-medium">{s.action}</span>
                  {isOpen
                    ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
                    : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />}
                </button>

                {isOpen && (
                  <div className="border-t border-border p-3 space-y-3 bg-muted/10">
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.rationale}</p>
                    {s.suggestedMessage && (
                      <div className="border border-border/50 p-3 relative">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Suggested Message</p>
                        <p className="text-xs leading-relaxed">{s.suggestedMessage}</p>
                        <button
                          onClick={() => void copyMessage(s.suggestedMessage!, i)}
                          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copied === i
                            ? <Check className="h-3.5 w-3.5 text-green-400" strokeWidth={1.5} />
                            : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <button
            onClick={() => void handleGenerate()}
            disabled={loading}
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mt-1"
          >
            <BrainCircuit className="h-3 w-3" strokeWidth={1.5} />
            Regenerate (1 credit)
          </button>
        </div>
      )}
    </div>
  )
}
