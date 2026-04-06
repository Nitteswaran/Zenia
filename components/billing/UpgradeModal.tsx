"use client"

import { useState } from "react"
import { X, Zap, ArrowRight } from "lucide-react"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"

const PLANS = [
  { name: "STARTER", display: "Starter", price: "$39", highlight: false },
  { name: "GROWTH", display: "Growth", price: "$99", highlight: true },
  { name: "BUSINESS", display: "Business", price: "$249", highlight: false },
]

export function UpgradeModal() {
  const { upgradeModalOpen, upgradeModalMessage, closeUpgradeModal } = useUIStore()
  const [loading, setLoading] = useState(false)

  if (!upgradeModalOpen) return null

  async function handleUpgrade(plan: string) {
    setLoading(true)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing: "monthly" }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={closeUpgradeModal} />
      <div className="relative z-10 w-full max-w-lg border border-border bg-card p-8">
        <button
          onClick={closeUpgradeModal}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-accent" strokeWidth={1.5} />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">Upgrade Required</span>
        </div>

        <h2 className="text-2xl font-display font-bold tracking-tight mb-2">Unlock This Feature</h2>
        <p className="text-muted-foreground text-sm mb-8">{upgradeModalMessage}</p>

        <div className="space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.name}
              disabled={loading}
              onClick={() => handleUpgrade(plan.name)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 border text-left transition-colors",
                plan.highlight
                  ? "border-accent bg-accent/5 hover:bg-accent/10"
                  : "border-border hover:border-foreground/30"
              )}
            >
              <div>
                <span className="font-medium">{plan.display}</span>
                {plan.highlight && (
                  <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-accent">
                    Most Popular
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-muted-foreground">{plan.price}/mo</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          No credit card required for Free plan · Cancel anytime
        </p>
      </div>
    </div>
  )
}
