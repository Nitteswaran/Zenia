import { getWorkspace } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Globe, Building2, Users } from "lucide-react"

export const metadata = { title: "Company — Zenia" }

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const ws = await getWorkspace()
  if (!ws) redirect("/login")

  const { id } = await params

  const company = await prisma.company.findFirst({
    where: { id, workspaceId: ws.workspace.id },
    include: {
      contacts: {
        select: { id: true, firstName: true, lastName: true, email: true, status: true },
        take: 20,
      },
      deals: {
        select: { id: true, title: true, value: true, currency: true, stage: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!company) notFound()

  const totalDealValue = company.deals.reduce((s, d) => s + d.value, 0)

  return (
    <div className="p-6 max-w-5xl">
      <Link
        href="/crm/companies"
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
        Companies
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 border border-border flex items-center justify-center bg-muted">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={company.name} className="h-10 w-10 object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">{company.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {company.industry && (
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{company.industry}</span>
              )}
              {company.size && (
                <span className="text-xs font-mono text-muted-foreground">{company.size} employees</span>
              )}
            </div>
          </div>
        </div>
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
          >
            <Globe className="h-3 w-3" strokeWidth={1.5} />
            Website
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-border mb-8">
        {[
          { label: "Contacts", value: company.contacts.length },
          { label: "Deals", value: company.deals.length },
          { label: "Pipeline Value", value: `$${totalDealValue.toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="bg-card p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-display font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Contacts */}
        <div className="border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Contacts</p>
          </div>
          {company.contacts.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No contacts linked.</p>
          ) : (
            <div className="divide-y divide-border">
              {company.contacts.map((c) => (
                <Link
                  key={c.id}
                  href={`/crm/contacts/${c.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.email}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider border border-border px-2 py-0.5 text-muted-foreground">
                    {c.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Deals */}
        <div className="border border-border">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Deals</p>
          </div>
          {company.deals.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No deals yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {company.deals.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{d.title}</p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{d.stage}</span>
                  </div>
                  <span className="text-sm font-mono font-medium">
                    {d.currency} {d.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {company.notes && (
        <div className="mt-6 border border-border p-5">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Notes</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{company.notes}</p>
        </div>
      )}
    </div>
  )
}
