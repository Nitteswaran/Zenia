import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { DealPipeline } from "@/components/crm/DealPipeline"

export const metadata: Metadata = { title: "Pipeline — Zenia CRM", description: "Deal pipeline kanban board." }

export default async function PipelinePage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const deals = await prisma.deal.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: { contact: true, company: true },
  })

  return (
    <div className="space-y-4">
      <div>
        <div className="h-px w-12 bg-accent mb-3" />
        <h1 className="font-display text-3xl font-medium tracking-tight">Deal Pipeline</h1>
        <p className="text-muted-foreground mt-1 text-sm">{deals.length} deals · ${deals.filter(d => !["CLOSED_WON","CLOSED_LOST"].includes(d.stage)).reduce((a,d) => a + d.value, 0).toLocaleString()} active pipeline</p>
      </div>
      <DealPipeline initialDeals={deals} />
    </div>
  )
}
