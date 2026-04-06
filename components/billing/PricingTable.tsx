"use client"

import { useState } from "react"
import { Check, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const PLANS = [
  {
    name: "FREE",
    display: "Free",
    monthly: 0,
    yearly: 0,
    description: "Try Zenia with no commitment",
    highlight: false,
    features: [
      "25 AI credits / month",
      "20 content pieces",
      "2 social accounts",
      "250 CRM contacts",
      "2 campaigns",
      "1 automation",
      "1 team member",
      "7-day analytics",
      "Community support",
    ],
    cta: "Get Started Free",
    ctaAction: "/signup",
  },
  {
    name: "STARTER",
    display: "Starter",
    monthly: 39,
    yearly: 390,
    description: "For solo marketers and small teams",
    highlight: false,
    features: [
      "200 AI credits / month",
      "200 content pieces",
      "5 social accounts",
      "2,500 CRM contacts",
      "10 campaigns",
      "5 automations",
      "3 team members",
      "30-day analytics",
      "Email support (48hr)",
    ],
    cta: "Start Starter",
    ctaAction: null,
  },
  {
    name: "GROWTH",
    display: "Growth",
    monthly: 99,
    yearly: 990,
    description: "For growing teams moving fast",
    highlight: true,
    features: [
      "1,000 AI credits / month",
      "Unlimited content",
      "15 social accounts",
      "25,000 CRM contacts",
      "Unlimited campaigns",
      "25 automations",
      "10 team members",
      "90-day analytics + CSV export",
      "All integrations",
      "API access (5K req/mo)",
      "Priority support (24hr)",
    ],
    cta: "Start Growth",
    ctaAction: null,
  },
  {
    name: "BUSINESS",
    display: "Business",
    monthly: 249,
    yearly: 2490,
    description: "For marketing departments at scale",
    highlight: false,
    features: [
      "5,000 AI credits / month",
      "Unlimited content",
      "50 social accounts",
      "100,000 CRM contacts",
      "Unlimited everything",
      "50 team members",
      "1-year analytics",
      "Salesforce + custom webhooks",
      "API access (50K req/mo)",
      "SSO / SAML",
      "Dedicated CSM",
      "Slack support (4hr)",
    ],
    cta: "Start Business",
    ctaAction: null,
  },
]

interface PricingTableProps {
  currentPlan?: string
  onSelectPlan?: (plan: string, billing: "monthly" | "yearly") => void
}

export function PricingTable({ currentPlan, onSelectPlan }: PricingTableProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <button
          onClick={() => setBilling("monthly")}
          className={cn(
            "text-sm font-mono uppercase tracking-wider transition-colors",
            billing === "monthly" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Monthly
        </button>
        <div
          className="w-10 h-5 border border-border relative cursor-pointer"
          onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
        >
          <div
            className={cn(
              "absolute top-0.5 h-4 w-4 bg-accent transition-all duration-200",
              billing === "yearly" ? "left-5" : "left-0.5"
            )}
          />
        </div>
        <button
          onClick={() => setBilling("yearly")}
          className={cn(
            "text-sm font-mono uppercase tracking-wider transition-colors",
            billing === "yearly" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Yearly
          <span className="ml-2 text-accent text-[10px]">–17%</span>
        </button>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.name
          const price = billing === "yearly" ? plan.yearly : plan.monthly

          return (
            <div
              key={plan.name}
              className={cn(
                "border p-6 flex flex-col relative",
                plan.highlight ? "border-accent" : "border-border"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-px left-0 right-0 h-px bg-accent" />
              )}
              {plan.highlight && (
                <div className="flex items-center gap-1 mb-3">
                  <Zap className="h-3 w-3 text-accent" strokeWidth={1.5} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-lg font-display font-bold tracking-tight">{plan.display}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-display font-bold tracking-tight">
                  {price === 0 ? "Free" : `$${price}`}
                </span>
                {price > 0 && (
                  <span className="text-xs text-muted-foreground font-mono ml-1">
                    /{billing === "yearly" ? "yr" : "mo"}
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                onClick={() => {
                  if (plan.ctaAction) {
                    window.location.href = plan.ctaAction
                  } else {
                    onSelectPlan?.(plan.name, billing)
                  }
                }}
                className={cn(
                  "w-full py-3 text-xs font-mono uppercase tracking-wider transition-colors",
                  isCurrent
                    ? "border border-border text-muted-foreground cursor-default"
                    : plan.highlight
                    ? "bg-accent text-foreground hover:bg-accent/90"
                    : "border border-border hover:border-foreground/50 text-foreground"
                )}
              >
                {isCurrent ? "Current Plan" : plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* Enterprise */}
      <div className="mt-4 border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold tracking-tight">Enterprise</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Custom from $699/month · Unlimited everything · Dedicated infrastructure · 24/7 support
          </p>
        </div>
        <a
          href="mailto:sales@zenia.ai"
          className="shrink-0 border border-border px-6 py-3 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
        >
          Talk to Sales
        </a>
      </div>
    </div>
  )
}
