import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Megaphone, BarChart3, FileText, Share2 } from "lucide-react"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const campaign = await prisma.campaign.findUnique({ where: { id } })
  return { title: campaign ? `${campaign.name} — Zenia` : "Campaign — Zenia" }
}

const statusColors: Record<string, "success" | "secondary" | "warning" | "destructive" | "outline"> = {
  ACTIVE: "success", DRAFT: "outline", PAUSED: "warning", COMPLETED: "secondary",
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      analytics: true,
      content: { orderBy: { createdAt: "desc" }, take: 10 },
      socialPosts: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  })
  if (!campaign) notFound()

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/campaigns" className="text-sm text-muted-foreground hover:text-foreground">Campaigns</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm">{campaign.name}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="h-px w-12 bg-accent mb-3" />
            <h1 className="font-display text-3xl font-medium tracking-tight">{campaign.name}</h1>
            {campaign.description && <p className="text-muted-foreground mt-1 text-sm">{campaign.description}</p>}
          </div>
          <Badge variant={statusColors[campaign.status] ?? "outline"}>{campaign.status}</Badge>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Type", value: campaign.type },
          { label: "Goal", value: campaign.goal ?? "—" },
          { label: "Start", value: campaign.startDate ? formatDate(campaign.startDate) : "—" },
          { label: "Budget", value: campaign.budget ? formatCurrency(campaign.budget) : "—" },
        ].map((item) => (
          <div key={item.label} className="border border-border bg-card p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
            <p className="text-sm font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Analytics */}
      {campaign.analytics && (
        <div>
          <h2 className="font-display text-xl font-medium tracking-tight mb-4">Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Impressions", value: campaign.analytics.impressions.toLocaleString() },
              { label: "Clicks", value: campaign.analytics.clicks.toLocaleString() },
              { label: "Conversions", value: campaign.analytics.conversions.toLocaleString() },
              { label: "ROAS", value: `${campaign.analytics.roas.toFixed(2)}×` },
            ].map((item) => (
              <div key={item.label} className="border border-border bg-card p-4">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                <p className="font-display text-2xl font-medium tracking-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {campaign.content.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-display text-lg font-medium tracking-tight">Content ({campaign.content.length})</h2>
          </div>
          <div className="border border-border divide-y divide-border">
            {campaign.content.map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-medium truncate">{c.title}</p>
                <Badge variant="outline">{c.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
