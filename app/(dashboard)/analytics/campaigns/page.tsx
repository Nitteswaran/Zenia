import { getWorkspace } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const metadata = { title: "Campaign Analytics — Zenia" }

export default async function CampaignAnalyticsPage() {
  const ws = await getWorkspace()
  if (!ws) redirect("/login")

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: ws.workspace.id },
    include: { analytics: true },
    orderBy: { createdAt: "desc" },
  })

  const totals = campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + (c.analytics?.impressions ?? 0),
      clicks: acc.clicks + (c.analytics?.clicks ?? 0),
      conversions: acc.conversions + (c.analytics?.conversions ?? 0),
      spend: acc.spend + (c.analytics?.spend ?? 0),
      revenue: acc.revenue + (c.analytics?.revenue ?? 0),
    }),
    { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 }
  )

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Analytics</p>
        <h1 className="text-3xl font-display font-bold tracking-tight">Campaign Analytics</h1>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-5 gap-px bg-border mb-8">
        {[
          { label: "Impressions", value: totals.impressions.toLocaleString() },
          { label: "Clicks", value: totals.clicks.toLocaleString() },
          { label: "Conversions", value: totals.conversions.toLocaleString() },
          { label: "Spend", value: `$${totals.spend.toLocaleString()}` },
          { label: "Revenue", value: `$${totals.revenue.toLocaleString()}` },
        ].map((m) => (
          <div key={m.label} className="bg-card p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{m.label}</p>
            <p className="text-2xl font-display font-bold tracking-tight">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Campaign table */}
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Campaign", "Status", "Impressions", "Clicks", "CTR", "Conversions", "Spend", "Revenue", "ROAS"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground text-sm">No campaigns yet.</td></tr>
            ) : (
              campaigns.map((c) => {
                const a = c.analytics
                const ctr = a && a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(2) : "—"
                const roas = a && a.spend > 0 ? (a.revenue / a.spend).toFixed(2) : "—"
                return (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className="border border-border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{a?.impressions.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{a?.clicks.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{ctr !== "—" ? `${ctr}%` : "—"}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{a?.conversions.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{a ? `$${a.spend.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{a ? `$${a.revenue.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{roas}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
