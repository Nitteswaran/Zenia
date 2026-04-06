"use client"

import { useState } from "react"
import { Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useContacts } from "@/hooks/use-contacts"
import type { Contact } from "@prisma/client"

const STATUS_COLORS: Record<string, string> = {
  NEW: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  CONTACTED: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  QUALIFIED: "text-green-400 border-green-400/30 bg-green-400/5",
  UNQUALIFIED: "text-muted-foreground border-border",
  CUSTOMER: "text-accent border-accent/30 bg-accent/5",
  CHURNED: "text-red-400 border-red-400/30 bg-red-400/5",
}

type SortKey = "name" | "email" | "status" | "score" | "createdAt"

interface ContactTableProps {
  onAddContact?: () => void
}

export function ContactTable({ onAddContact }: ContactTableProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const { data, isLoading } = useContacts({ search, status, page, pageSize: 25 })

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-foreground" strokeWidth={1.5} />
      : <ChevronDown className="h-3 w-3 text-foreground" strokeWidth={1.5} />
  }

  // Client-side sort (server returns 25 at a time)
  const sorted = [...(data?.data ?? [])].sort((a, b) => {
    let av: string | number = ""
    let bv: string | number = ""
    if (sortKey === "name") {
      av = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim().toLowerCase()
      bv = `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim().toLowerCase()
    } else if (sortKey === "email") {
      av = a.email.toLowerCase()
      bv = b.email.toLowerCase()
    } else if (sortKey === "status") {
      av = a.status
      bv = b.status
    } else if (sortKey === "score") {
      av = a.score
      bv = b.score
    } else {
      av = new Date(a.createdAt).getTime()
      bv = new Date(b.createdAt).getTime()
    }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === "asc" ? cmp : -cmp
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search contacts…"
            className="w-full pl-9 pr-3 py-2 bg-input border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <select
          value={status ?? ""}
          onChange={(e) => { setStatus(e.target.value || undefined); setPage(1) }}
          className="bg-input border border-border px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          {["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CUSTOMER", "CHURNED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {onAddContact && (
          <button
            onClick={onAddContact}
            className="flex items-center gap-1.5 border border-border px-4 py-2 text-sm font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Add
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {([
                ["name", "Name"],
                ["email", "Email"],
                ["status", "Status"],
                ["score", "Score"],
                ["createdAt", "Added"],
              ] as [SortKey, string][]).map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="text-left px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon col={key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Loading contacts…
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No contacts found.
                </td>
              </tr>
            ) : (
              sorted.map((contact) => (
                <ContactRow key={contact.id} contact={contact} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>{data.total} contacts</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-border hover:border-foreground/30 disabled:opacity-40 transition-colors"
            >
              Prev
            </button>
            <span>{page} / {data.totalPages}</span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-border hover:border-foreground/30 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ContactRow({ contact }: { contact: Contact }) {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"
  const initials = [contact.firstName?.[0], contact.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?"

  return (
    <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/crm/contacts/${contact.id}`} className="flex items-center gap-3 hover:text-accent transition-colors">
          <div className="h-7 w-7 bg-muted border border-border flex items-center justify-center text-[10px] font-mono shrink-0">
            {initials}
          </div>
          <span className="font-medium">{fullName}</span>
        </Link>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{contact.email}</td>
      <td className="px-4 py-3">
        <span className={cn("border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", STATUS_COLORS[contact.status] ?? "border-border text-muted-foreground")}>
          {contact.status}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-muted-foreground">{contact.score}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs">
        {new Date(contact.createdAt).toLocaleDateString()}
      </td>
    </tr>
  )
}
