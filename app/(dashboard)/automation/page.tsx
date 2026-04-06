import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { formatRelativeDate } from "@/lib/utils"
import { Zap, Plus, Play, Pause, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = { title: "Automation — Zenia", description: "Workflow automation engine." }

const TEMPLATES = [
  { name: "Welcome new contact", trigger: "contact_created", desc: "Send a welcome email when a new contact is added" },
  { name: "Lead nurture sequence", trigger: "contact_created", desc: "3-email drip sequence over 7 days" },
  { name: "Publish + notify", trigger: "content_published", desc: "Post published → Slack team alert" },
  { name: "Weekly content report", trigger: "scheduled", desc: "Every Monday, email the week's performance report" },
  { name: "Deal won celebration", trigger: "deal_stage_changed", desc: "Deal closed → send team Slack message" },
]

export default async function AutomationPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const automations = await prisma.automation.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { logs: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-px w-12 bg-accent mb-3" />
          <h1 className="font-display text-3xl font-medium tracking-tight">Automation</h1>
          <p className="text-muted-foreground mt-1 text-sm">{automations.length} workflow{automations.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/automation/new"><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />New Workflow</Link>
        </Button>
      </div>

      {automations.length === 0 && (
        <div className="border border-border bg-card flex flex-col items-center justify-center py-16 text-center mb-6">
          <Zap className="h-10 w-10 text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-sm font-medium mb-1">No automations yet</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm">Build workflows that run automatically — send emails, schedule posts, update contacts, and more.</p>
          <Button variant="secondary" asChild><Link href="/automation/new"><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />Create Workflow</Link></Button>
        </div>
      )}

      {automations.length > 0 && (
        <div className="border border-border">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-border bg-muted">
            {["Workflow", "Status", "Trigger", "Runs", "Last Run"].map((h) => (
              <p key={h} className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{h}</p>
            ))}
          </div>
          {automations.map((auto) => (
            <Link key={auto.id} href={`/automation/${auto.id}`}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center"
            >
              <div>
                <p className="text-sm font-medium">{auto.name}</p>
                {auto.description && <p className="text-xs text-muted-foreground mt-0.5">{auto.description}</p>}
              </div>
              <Badge variant={auto.status === "ACTIVE" ? "success" : auto.status === "INACTIVE" ? "outline" : "secondary"}>{auto.status}</Badge>
              <p className="text-xs font-mono text-muted-foreground">{(auto.trigger as Record<string, string>).type ?? "—"}</p>
              <p className="text-xs font-mono text-muted-foreground">{auto.runCount}</p>
              <p className="text-xs font-mono text-muted-foreground whitespace-nowrap">{auto.lastRunAt ? formatRelativeDate(auto.lastRunAt) : "Never"}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Templates */}
      <div>
        <h2 className="font-display text-lg font-medium tracking-tight mb-3">Pre-built Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="border border-border bg-card p-4 space-y-2 group hover:border-foreground/30 transition-colors">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium">{t.name}</p>
                <Button variant="ghost" size="sm" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy className="h-3 w-3 mr-1" strokeWidth={1.5} />Use
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
              <span className="text-[10px] font-mono uppercase tracking-wider border border-border px-1.5 py-0.5 text-muted-foreground">{t.trigger}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
