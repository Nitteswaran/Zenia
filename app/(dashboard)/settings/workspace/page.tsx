"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"

interface Workspace {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  website: string | null
  industry: string | null
  timezone: string
  plan: string
}

export default function WorkspaceSettingsPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const router = useRouter()
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [showDelete, setShowDelete] = useState(false)

  const { data: workspace, isLoading } = useQuery<Workspace>({
    queryKey: ["workspace-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings/workspace")
      if (!res.ok) throw new Error("Failed to load workspace")
      return res.json()
    },
  })

  const [form, setForm] = useState<Partial<Workspace>>({})

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Workspace>) => {
      const res = await fetch("/api/settings/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace-settings"] })
      toast({ title: "Workspace updated" })
      setForm({})
    },
    onError: (err) => toast({ title: err.message, variant: "destructive" }),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings/workspace", { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete workspace")
    },
    onSuccess: () => {
      router.push("/login")
    },
    onError: () => toast({ title: "Failed to delete workspace", variant: "destructive" }),
  })

  const merged = { ...workspace, ...form }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (Object.keys(form).length === 0) return
    updateMutation.mutate(form)
  }

  if (isLoading) return <div className="p-6 text-muted-foreground text-sm">Loading…</div>

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Settings</p>
        <h1 className="text-3xl font-display font-bold tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your workspace identity and preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General */}
        <div className="border border-border p-5 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">General</p>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Workspace Name</label>
            <input
              value={merged.name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Slug</label>
            <input
              value={merged.slug ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
              className="w-full bg-input border border-border px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Used in URLs. Lowercase alphanumeric and hyphens only.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Website</label>
            <input
              value={merged.website ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value || null }))}
              placeholder="https://example.com"
              className="w-full bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Industry</label>
            <select
              value={merged.industry ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value || null }))}
              className="w-full bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select industry</option>
              {["Technology", "Marketing", "E-commerce", "Healthcare", "Finance", "Education", "Media", "Retail", "Real Estate", "Other"].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Timezone</label>
            <select
              value={merged.timezone ?? "UTC"}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              className="w-full bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {[
                "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
                "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Singapore",
                "Asia/Dubai", "Australia/Sydney",
              ].map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={Object.keys(form).length === 0 || updateMutation.isPending}
            className="border border-border px-5 py-2.5 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-10 border border-accent/40 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" strokeWidth={1.5} />
          <p className="text-xs font-mono uppercase tracking-widest text-accent">Danger Zone</p>
        </div>

        {!showDelete ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Workspace</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently delete this workspace and all its data. This cannot be undone.</p>
            </div>
            <button
              onClick={() => setShowDelete(true)}
              className="border border-accent/50 text-accent px-4 py-2 text-xs font-mono uppercase tracking-wider hover:border-accent transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">Type <span className="font-mono font-bold">{workspace?.name}</span> to confirm deletion.</p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={workspace?.name}
              className="w-full bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm("") }}
                className="border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteConfirm !== workspace?.name || deleteMutation.isPending}
                className="border border-accent bg-accent/10 text-accent px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-accent/20 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting…" : "Permanently Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
