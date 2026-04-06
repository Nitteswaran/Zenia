"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Search, Plus, Building2 } from "lucide-react"

interface Company {
  id: string
  name: string
  domain: string | null
  industry: string | null
  size: string | null
  createdAt: string
  _count: { contacts: number; deals: number }
}

interface CompaniesResponse {
  data: Company[]
  total: number
}

export default function CompaniesPage() {
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery<CompaniesResponse>({
    queryKey: ["companies", search],
    queryFn: async () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ""
      const res = await fetch(`/api/crm/companies${qs}`)
      if (!res.ok) throw new Error("Failed")
      return res.json() as Promise<CompaniesResponse>
    },
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">CRM</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">Companies</h1>
        </div>
        <button className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          Add Company
        </button>
      </div>

      <div className="relative max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies…"
          className="w-full pl-9 pr-3 py-2 bg-input border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Company", "Domain", "Industry", "Contacts", "Deals"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">Loading…</td></tr>
            ) : !data?.data?.length ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No companies found.</td></tr>
            ) : (
              data.data.map((co) => (
                <tr key={co.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/crm/companies/${co.id}`} className="flex items-center gap-3 hover:text-accent transition-colors">
                      <div className="h-7 w-7 bg-muted border border-border flex items-center justify-center shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <span className="font-medium">{co.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{co.domain ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{co.industry ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{co._count.contacts}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{co._count.deals}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
