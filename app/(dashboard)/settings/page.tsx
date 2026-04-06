import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Settings, Building2, CreditCard, Key } from "lucide-react"

export const metadata: Metadata = { title: "Settings — Zenia", description: "Manage your workspace and account settings." }

const SETTINGS_SECTIONS = [
  { href: "/settings/workspace", icon: Building2, label: "Workspace", desc: "Name, logo, brand voice, timezone" },
  { href: "/settings/billing", icon: CreditCard, label: "Billing", desc: "Plan, usage, invoices, payment method" },
  { href: "/settings/api-keys", icon: Key, label: "API Keys", desc: "Generate and manage API keys" },
]

export default async function SettingsPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="h-px w-12 bg-accent mb-3" />
        <h1 className="font-display text-3xl font-medium tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your workspace and account preferences.</p>
      </div>

      {/* Account Info */}
      <div className="border border-border bg-card p-5 space-y-4">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Account</p>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-muted border border-border flex items-center justify-center text-sm font-mono font-medium">
            {dbUser?.name?.charAt(0)?.toUpperCase() ?? authUser.email?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-medium">{dbUser?.name ?? "User"}</p>
            <p className="text-sm text-muted-foreground">{dbUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Workspace Info */}
      <div className="border border-border bg-card p-5 space-y-3">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Workspace</p>
        <div className="space-y-2">
          {[
            { label: "Name", value: workspace.name },
            { label: "Plan", value: workspace.plan },
            { label: "AI Credits", value: `${workspace.aiCreditsUsed} / ${workspace.aiCreditsLimit} used` },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-sm border-b border-border last:border-0 pb-2 last:pb-0">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="space-y-2">
        {SETTINGS_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-center gap-4 border border-border bg-card p-4 hover:border-foreground/30 hover:bg-muted transition-all duration-150 group"
          >
            <section.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-sm font-medium">{section.label}</p>
              <p className="text-xs text-muted-foreground">{section.desc}</p>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
