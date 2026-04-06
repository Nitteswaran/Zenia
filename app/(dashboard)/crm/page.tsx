import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { formatRelativeDate } from "@/lib/utils"
import { Plus, Users, Layers, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrmInsightsPanel } from "@/components/crm/CrmInsightsPanel"
import { LeadScoreActions } from "@/components/crm/LeadScoreActions"

export const metadata: Metadata = { title: "CRM — Zenia", description: "Contact and deal management." }

const statusColors: Record<string, "success" | "secondary" | "warning" | "outline"> = {
  NEW: "outline", CONTACTED: "secondary", QUALIFIED: "success", UNQUALIFIED: "warning", CUSTOMER: "success", CHURNED: "secondary",
}

export default async function CRMPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const [contacts, deals, hotCount, segmentCount] = await Promise.all([
    prisma.contact.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" }, take: 20, include: { company: true } }),
    prisma.deal.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.contact.count({ where: { workspaceId: workspace.id, scoreLabel: "hot" } }),
    prisma.segment.count({ where: { workspaceId: workspace.id } }),
  ])

  const pipelineValue = deals.filter(d => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)).reduce((a, d) => a + d.value, 0)
  const wonValue = deals.filter(d => d.stage === "CLOSED_WON").reduce((a, d) => a + d.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-px w-12 bg-accent mb-3" />
          <h1 className="font-display text-3xl font-medium tracking-tight">CRM</h1>
          <p className="text-muted-foreground mt-1 text-sm">{contacts.length} contacts · ${pipelineValue.toLocaleString()} pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild><Link href="/crm/segments"><Layers className="h-4 w-4 mr-1" strokeWidth={1.5} />Segments</Link></Button>
          <Button variant="secondary" asChild><Link href="/crm/pipeline">Pipeline</Link></Button>
          <Button variant="secondary" asChild><Link href="/crm/contacts"><Plus className="h-4 w-4 mr-1" strokeWidth={1.5} />Add Contact</Link></Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Contacts", value: contacts.length },
          { label: "Active Deals", value: deals.filter(d => !["CLOSED_WON","CLOSED_LOST"].includes(d.stage)).length },
          { label: "Pipeline Value", value: `$${pipelineValue.toLocaleString()}` },
          { label: "Won Revenue", value: `$${wonValue.toLocaleString()}` },
          { label: "Hot Leads", value: hotCount, accent: true },
          { label: "Segments", value: segmentCount },
        ].map((kpi) => (
          <div key={kpi.label} className={`border p-4 ${(kpi as { accent?: boolean }).accent ? "border-accent/40 bg-accent/5" : "border-border bg-card"}`}>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              {(kpi as { accent?: boolean }).accent && <Flame className="h-3 w-3 text-accent" strokeWidth={1.5} />}
              {kpi.label}
            </p>
            <p className="font-display text-2xl font-medium tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Lead Score + AI Actions row */}
      <LeadScoreActions />

      {/* AI Insights */}
      <CrmInsightsPanel />

      {/* Contacts table */}
      <div>
        <h2 className="font-display text-lg font-medium tracking-tight mb-3">Recent Contacts</h2>
        {contacts.length === 0 ? (
          <div className="border border-border bg-card flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3" strokeWidth={1} />
            <p className="text-sm font-medium mb-1">No contacts yet</p>
            <p className="text-xs text-muted-foreground mb-4">Add your first contact or import from CSV</p>
          </div>
        ) : (
          <div className="border border-border">
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-2 border-b border-border bg-muted">
              {["Name", "Company", "Status", "Added"].map((h) => (
                <p key={h} className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{h}</p>
              ))}
            </div>
            {contacts.map((c) => (
              <Link key={c.id} href={`/crm/contacts/${c.id}`} className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center">
                <div>
                  <p className="text-sm font-medium">{[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
                <p className="text-sm text-muted-foreground">{c.company?.name ?? "—"}</p>
                <Badge variant={statusColors[c.status] ?? "outline"}>{c.status}</Badge>
                <p className="text-xs text-muted-foreground font-mono whitespace-nowrap">{formatRelativeDate(c.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
