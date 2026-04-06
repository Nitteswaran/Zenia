"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Users, Loader2 } from "lucide-react"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import type { SegmentFilters } from "@/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_COLORS: Record<string, "success" | "secondary" | "warning" | "outline"> = {
  NEW: "outline", CONTACTED: "secondary", QUALIFIED: "success",
  UNQUALIFIED: "warning", CUSTOMER: "success", CHURNED: "secondary",
}

const SCORE_COLOR = (s: number) =>
  s >= 65 ? "text-green-400" : s >= 35 ? "text-yellow-400" : "text-muted-foreground"

interface SegmentDetail {
  id: string
  name: string
  description?: string | null
  filters: SegmentFilters
  contactCount: number
}

interface ContactRow {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
  status: string
  score: number
  scoreLabel?: string | null
  company?: { name: string } | null
}

interface ContactsResponse {
  data: ContactRow[]
  total: number
}

export default function SegmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: segment, isLoading: segLoading } = useSWR<SegmentDetail>(
    `/api/crm/segments/${id}`,
    fetcher
  )
  const { data: contactsData, isLoading: contactsLoading } = useSWR<ContactsResponse>(
    `/api/crm/segments/${id}/contacts?pageSize=50`,
    fetcher
  )

  if (segLoading) {
    return (
      <div className="p-6 flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={1.5} />
      </div>
    )
  }

  if (!segment) return null

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <Link href="/crm/segments" className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        All Segments
      </Link>

      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">{segment.name}</h1>
        {segment.description && <p className="text-sm text-muted-foreground mt-1">{segment.description}</p>}
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {segment.contactCount} contacts
          </span>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {(segment.filters as SegmentFilters).conditions.length} conditions · {(segment.filters as SegmentFilters).logic}
          </span>
        </div>
      </div>

      {/* Filter summary */}
      <div className="border border-border bg-muted/20 p-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Filter Rules</p>
        <div className="space-y-1">
          {(segment.filters as SegmentFilters).conditions.map((c, i) => (
            <p key={i} className="text-sm">
              <span className="text-muted-foreground font-mono text-xs uppercase">{c.field}</span>
              {" "}
              <span className="text-muted-foreground text-xs">{c.operator.replace(/_/g, " ")}</span>
              {" "}
              <span className="font-medium text-xs">{Array.isArray(c.value) ? c.value.join(", ") : String(c.value)}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Contacts table */}
      <div>
        <h2 className="font-display text-lg font-medium tracking-tight mb-3">
          Contacts {contactsData ? `(${contactsData.total})` : ""}
        </h2>
        {contactsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" strokeWidth={1.5} />
          </div>
        ) : !contactsData?.data?.length ? (
          <div className="border border-border bg-card flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-2" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">No contacts match these filters</p>
          </div>
        ) : (
          <div className="border border-border">
            <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-4 py-2 border-b border-border bg-muted">
              {["Name", "Company", "Status", "Score", ""].map((h, i) => (
                <p key={i} className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{h}</p>
              ))}
            </div>
            {contactsData.data.map((c) => (
              <Link
                key={c.id}
                href={`/crm/contacts/${c.id}`}
                className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center"
              >
                <div>
                  <p className="text-sm font-medium">
                    {[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
                <p className="text-sm text-muted-foreground">{c.company?.name ?? "—"}</p>
                <Badge variant={STATUS_COLORS[c.status] ?? "outline"}>{c.status}</Badge>
                <span className={`text-sm font-mono font-medium ${SCORE_COLOR(c.score)}`}>
                  {c.score}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {c.scoreLabel ?? "—"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
