import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/lib/plan-limits"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const metadata: Metadata = { title: "Billing — Zenia", description: "Manage your plan and billing." }

const PLANS = [
  { key: "FREE", name: "Free", price: 0, yearlyPrice: 0 },
  { key: "STARTER", name: "Starter", price: 39, yearlyPrice: 390 },
  { key: "GROWTH", name: "Growth", price: 99, yearlyPrice: 990, popular: true },
  { key: "BUSINESS", name: "Business", price: 249, yearlyPrice: 2490 },
]

export default async function BillingPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const limits = PLAN_LIMITS[workspace.plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.FREE
  const creditsPercent = Math.min((workspace.aiCreditsUsed / workspace.aiCreditsLimit) * 100, 100)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="h-px w-12 bg-accent mb-3" />
        <h1 className="font-display text-3xl font-medium tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your plan, usage, and payment method.</p>
      </div>

      {/* Current Plan */}
      <div className="border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Current Plan</p>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-medium tracking-tight">{workspace.plan}</h2>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/pricing">Upgrade Plan</Link>
          </Button>
        </div>

        {/* Usage Bars */}
        <div className="space-y-3 border-t border-border pt-4">
          {[
            { label: "AI Credits", used: workspace.aiCreditsUsed, limit: workspace.aiCreditsLimit },
            { label: "Social Accounts", used: 0, limit: limits.social === -1 ? 999 : limits.social },
            { label: "Team Seats", used: 1, limit: limits.seats === -1 ? 999 : limits.seats },
          ].map((usage) => {
            const pct = Math.min((usage.used / usage.limit) * 100, 100)
            const near = pct >= 80
            return (
              <div key={usage.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className={near ? "text-accent" : "text-muted-foreground"}>{usage.label}</span>
                  <span className={near ? "text-accent" : "text-muted-foreground"}>{usage.used} / {usage.limit === 999 ? "∞" : usage.limit}</span>
                </div>
                <div className="h-1.5 w-full bg-muted overflow-hidden">
                  <div className={`h-full transition-all ${near ? "bg-accent" : "bg-foreground/30"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Plans comparison */}
      <div>
        <h2 className="font-display text-lg font-medium tracking-tight mb-4">Available Plans</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`border bg-card p-4 space-y-3 ${plan.popular ? "border-accent" : "border-border"} ${workspace.plan === plan.key ? "border-foreground" : ""}`}
            >
              {plan.popular && (
                <span className="text-[10px] font-mono uppercase tracking-wider bg-accent text-accent-foreground px-2 py-0.5">Most Popular</span>
              )}
              <div>
                <p className="text-sm font-medium">{plan.name}</p>
                <p className="font-display text-2xl font-medium tracking-tight">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground font-mono">
                <p>{PLAN_LIMITS[plan.key as keyof typeof PLAN_LIMITS]?.credits ?? "?"} AI credits</p>
                <p>{PLAN_LIMITS[plan.key as keyof typeof PLAN_LIMITS]?.contacts === -1 ? "Unlimited" : PLAN_LIMITS[plan.key as keyof typeof PLAN_LIMITS]?.contacts} contacts</p>
                <p>{PLAN_LIMITS[plan.key as keyof typeof PLAN_LIMITS]?.seats === -1 ? "Unlimited" : PLAN_LIMITS[plan.key as keyof typeof PLAN_LIMITS]?.seats} seats</p>
              </div>
              {workspace.plan === plan.key ? (
                <Badge variant="secondary" className="w-full justify-center">Current</Badge>
              ) : (
                <Button variant="secondary" size="sm" className="w-full">
                  {plan.price === 0 ? "Downgrade" : workspace.plan === "FREE" || PLANS.findIndex(p => p.key === workspace.plan) < PLANS.findIndex(p => p.key === plan.key) ? "Upgrade" : "Downgrade"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Credit Add-ons */}
      <div>
        <h2 className="font-display text-lg font-medium tracking-tight mb-3">AI Credit Top-ups</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { credits: "200 credits", price: "$15" },
            { credits: "1,000 credits", price: "$59" },
            { credits: "5,000 credits", price: "$199" },
          ].map((addon) => (
            <div key={addon.credits} className="border border-border bg-card p-4 space-y-2">
              <p className="font-display text-xl font-medium">{addon.price}</p>
              <p className="text-xs text-muted-foreground font-mono">{addon.credits}</p>
              <Button variant="secondary" size="sm" className="w-full">Buy</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
