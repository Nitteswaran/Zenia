import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { Plus, Megaphone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Campaigns — Zenia",
  description: "Manage all your marketing campaigns in one place.",
}

const statusColors: Record<string, "success" | "secondary" | "warning" | "destructive" | "outline"> = {
  ACTIVE: "success", DRAFT: "outline", PAUSED: "warning", COMPLETED: "secondary", ARCHIVED: "secondary",
}

const typeLabels: Record<string, string> = {
  EMAIL: "Email", SOCIAL: "Social", CONTENT: "Content", SEO: "SEO", PAID: "Paid", MULTI_CHANNEL: "Multi-Channel",
}

export default async function CampaignsPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: { analytics: true, _count: { select: { content: true, socialPosts: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-px w-12 bg-accent mb-3" />
          <h1 className="font-display text-3xl font-medium tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1 text-sm">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/campaigns/new"><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />New Campaign</Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="border border-border bg-card flex flex-col items-center justify-center py-24 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1} />
          <h2 className="font-display text-xl font-medium mb-2">No campaigns yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">Create your first multi-channel marketing campaign with AI-generated strategy and content calendar.</p>
          <Button variant="secondary" asChild>
            <Link href="/campaigns/new"><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />New Campaign</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="border border-border bg-card p-5 hover:border-foreground/30 transition-colors duration-150 space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={statusColors[campaign.status] ?? "outline"}>{campaign.status}</Badge>
                  <Badge variant="secondary">{typeLabels[campaign.type] ?? campaign.type}</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm group-hover:text-accent transition-colors">{campaign.name}</h3>
                {campaign.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{campaign.description}</p>}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                <span>{campaign._count.content} pieces</span>
                <span>{campaign._count.socialPosts} posts</span>
                {campaign.startDate && <span>{formatDate(campaign.startDate, "MMM d")}</span>}
              </div>
              {campaign.channels.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {campaign.channels.map((ch) => (
                    <span key={ch} className="text-[10px] font-mono uppercase tracking-wider border border-border px-1.5 py-0.5 text-muted-foreground">{ch}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
