"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Plus, Wand2, Trash2, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { SegmentBuilder, AiSegmentSuggest } from "@/components/crm/SegmentBuilder"
import useSWR, { mutate as globalMutate } from "swr"
import type { SegmentFilters } from "@/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Segment {
  id: string
  name: string
  description?: string | null
  filters: SegmentFilters
  contactCount: number
  isAiSuggested: boolean
  createdAt: string
}

const emptyFilters: SegmentFilters = {
  conditions: [{ field: "status", operator: "equals", value: "QUALIFIED" }],
  logic: "AND",
}

export default function SegmentsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { data: segments, isLoading } = useSWR<Segment[]>("/api/crm/segments", fetcher)

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [filters, setFilters] = useState<SegmentFilters>(emptyFilters)
  const [saving, setSaving] = useState(false)

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ name: string; description: string; filters: SegmentFilters }>>([])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || filters.conditions.length === 0) return
    setSaving(true)
    try {
      const res = await fetch("/api/crm/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, filters }),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      toast({ title: "Segment created" })
      setShowCreate(false)
      setName("")
      setDescription("")
      setFilters(emptyFilters)
      await globalMutate("/api/crm/segments")
    } catch (err) {
      toast({ title: "Failed to create segment", description: String(err), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAiSuggestion(s: { name: string; description: string; filters: SegmentFilters }) {
    try {
      const res = await fetch("/api/crm/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: `Segment "${s.name}" saved` })
      setAiSuggestions((prev) => prev.filter((x) => x !== s))
      await globalMutate("/api/crm/segments")
    } catch {
      toast({ title: "Failed to save segment", variant: "destructive" })
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/crm/segments/${id}`, { method: "DELETE" })
      toast({ title: "Segment deleted" })
      await globalMutate("/api/crm/segments")
    } catch {
      toast({ title: "Failed to delete segment", variant: "destructive" })
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="h-px w-12 bg-accent mb-3" />
          <h1 className="font-display text-3xl font-medium tracking-tight">Segments</h1>
          <p className="text-muted-foreground mt-1 text-sm">Dynamic contact groups based on CRM data</p>
        </div>
        <div className="flex items-center gap-3">
          <AiSegmentSuggest onSuggestions={setAiSuggestions} />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            New Segment
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="border border-accent/30 bg-accent/5 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
            <span className="text-xs font-mono uppercase tracking-wider text-accent">AI Suggested Segments</span>
          </div>
          {aiSuggestions.map((s, i) => (
            <div key={i} className="border border-border bg-card p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  {s.filters.conditions.length} condition{s.filters.conditions.length !== 1 ? "s" : ""} · {s.filters.logic}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setAiSuggestions((prev) => prev.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => void handleSaveAiSuggestion(s)}
                  className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="border border-border bg-card p-6 space-y-4">
          <h2 className="font-display text-lg font-medium tracking-tight">Create Segment</h2>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. High-potential qualified leads"
                className="w-full bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Filter Conditions</label>
              <SegmentBuilder filters={filters} onChange={setFilters} />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs font-mono uppercase tracking-wider hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {saving ? "Saving…" : "Create Segment"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Segment list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={1.5} />
        </div>
      ) : !segments || segments.length === 0 ? (
        <div className="border border-border bg-card flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-sm font-medium mb-1">No segments yet</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first segment or let AI suggest ones based on your data</p>
        </div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{seg.name}</p>
                  {seg.isAiSuggested && (
                    <span className="border border-accent/40 text-accent px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider">AI</span>
                  )}
                </div>
                {seg.description && <p className="text-xs text-muted-foreground mt-0.5">{seg.description}</p>}
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  {(seg.filters as SegmentFilters).conditions.length} condition{(seg.filters as SegmentFilters).conditions.length !== 1 ? "s" : ""} · {(seg.filters as SegmentFilters).logic}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-medium">{seg.contactCount.toLocaleString()}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">contacts</p>
                </div>
                <button
                  onClick={() => router.push(`/crm/segments/${seg.id}`)}
                  className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  View <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => void handleDelete(seg.id)}
                  className="text-muted-foreground hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
