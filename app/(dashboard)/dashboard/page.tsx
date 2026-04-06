import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { Bot, FileText, Megaphone, Share2, Users, TrendingUp, Plus, Zap, ArrowRight } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"

export const metadata: Metadata = {
  title: "Command Centre — Zenia",
  description: "Your AI marketing command centre. Overview of campaigns, content, social, and CRM.",
}

export default async function DashboardPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: {
      workspaceMembers: {
        include: { workspace: true },
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
  })

  const workspace = dbUser?.workspaceMembers[0]?.workspace

  if (!workspace) redirect("/login")

  // Fetch KPI data
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [contentCount, campaignCount, socialPostCount, contactCount, dealAggregate] = await Promise.all([
    prisma.content.count({ where: { workspaceId: workspace.id } }),
    prisma.campaign.count({ where: { workspaceId: workspace.id, status: "ACTIVE" } }),
    prisma.socialPost.count({
      where: {
        workspaceId: workspace.id,
        status: "SCHEDULED",
        scheduledAt: { gte: now, lte: in7Days },
      },
    }),
    prisma.contact.count({ where: { workspaceId: workspace.id } }),
    prisma.deal.aggregate({
      where: {
        workspaceId: workspace.id,
        stage: { in: ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION"] },
      },
      _sum: { value: true },
    }),
  ])

  const pipelineValue = dealAggregate._sum.value ?? 0
  const creditsRemaining = workspace.aiCreditsLimit - workspace.aiCreditsUsed

  const kpis = [
    {
      label: "AI Credits Remaining",
      value: formatNumber(creditsRemaining),
      sub: `${workspace.aiCreditsUsed} used of ${workspace.aiCreditsLimit}`,
      icon: Bot,
      href: "/settings/billing",
      accent: creditsRemaining < workspace.aiCreditsLimit * 0.2,
    },
    {
      label: "Content Pieces",
      value: formatNumber(contentCount),
      sub: "Total in library",
      icon: FileText,
      href: "/content",
    },
    {
      label: "Active Campaigns",
      value: formatNumber(campaignCount),
      sub: "Running now",
      icon: Megaphone,
      href: "/campaigns",
    },
    {
      label: "Scheduled Posts",
      value: formatNumber(socialPostCount),
      sub: "Next 7 days",
      icon: Share2,
      href: "/social/calendar",
    },
    {
      label: "Total Contacts",
      value: formatNumber(contactCount),
      sub: "In CRM",
      icon: Users,
      href: "/crm/contacts",
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      sub: "Active deals",
      icon: TrendingUp,
      href: "/crm/pipeline",
    },
  ]

  const quickActions = [
    { label: "Generate Content", href: "/content/generate", icon: FileText, description: "AI-powered content for any platform" },
    { label: "Schedule Post", href: "/social/compose", icon: Share2, description: "Post to multiple channels at once" },
    { label: "Add Contact", href: "/crm/contacts", icon: Users, description: "Add a lead to your CRM" },
    { label: "New Campaign", href: "/campaigns/new", icon: Megaphone, description: "Launch a multi-channel campaign" },
    { label: "Ask Zenia", href: "/zenia-ai", icon: Bot, description: "Your AI executive assistant" },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="h-px w-12 bg-accent mb-3" />
        <h1 className="font-display text-3xl font-medium tracking-tight">Command Centre</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group border border-border bg-card p-4 hover:border-foreground/30 transition-colors duration-150 space-y-3"
          >
            <div className="flex items-center justify-between">
              <kpi.icon
                className={`h-4 w-4 ${kpi.accent ? "text-accent" : "text-muted-foreground"}`}
                strokeWidth={1.5}
              />
              <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={1.5} />
            </div>
            <div>
              <p className={`font-display text-2xl font-medium tracking-tight ${kpi.accent ? "text-accent" : ""}`}>
                {kpi.value}
              </p>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">{kpi.label}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{kpi.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <DashboardCharts />

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-medium tracking-tight">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group border border-border bg-card p-4 hover:border-foreground/30 hover:bg-muted transition-all duration-150 space-y-3"
            >
              <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
