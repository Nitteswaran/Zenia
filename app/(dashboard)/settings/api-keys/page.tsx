"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Key, Plus, Trash2, Copy, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt: string | null
  usageCount: number
  createdAt: string
  key?: string // only present right after creation
}

export default function ApiKeysPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [newKeyName, setNewKeyName] = useState("")
  const [justCreated, setJustCreated] = useState<ApiKey | null>(null)
  const [showKey, setShowKey] = useState(false)

  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await fetch("/api/api-keys")
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      return res.json() as Promise<ApiKey[]>
    },
  })

  const createKey = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      return res.json() as Promise<ApiKey>
    },
    onSuccess: (key) => {
      qc.invalidateQueries({ queryKey: ["api-keys"] })
      setJustCreated(key)
      setNewKeyName("")
      setShowKey(true)
    },
    onError: (err) => toast({ title: err.message, variant: "destructive" }),
  })

  const deleteKey = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to revoke key")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] })
      toast({ title: "API key revoked" })
    },
    onError: () => toast({ title: "Failed to revoke key", variant: "destructive" }),
  })

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => toast({ title: "Copied to clipboard" }))
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Settings</p>
        <h1 className="text-3xl font-display font-bold tracking-tight">API Keys</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Generate API keys to access Zenia's REST API. Keys are hashed — show once on creation.
        </p>
      </div>

      {/* Just-created key reveal */}
      {justCreated && (
        <div className="border border-accent/40 bg-accent/5 p-5 mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-accent" strokeWidth={1.5} />
            <p className="text-sm font-medium">Key created: <span className="font-mono">{justCreated.name}</span></p>
          </div>
          <p className="text-xs text-muted-foreground">Copy this key now. You won't be able to see it again.</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-muted border border-border px-3 py-2 text-xs font-mono overflow-x-auto">
              {showKey ? justCreated.key : "•".repeat(60)}
            </code>
            <button onClick={() => setShowKey((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
              {showKey ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
            </button>
            <button onClick={() => copyToClipboard(justCreated.key ?? "")} className="text-muted-foreground hover:text-foreground transition-colors">
              <Copy className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <button onClick={() => setJustCreated(null)} className="text-xs text-muted-foreground hover:text-foreground font-mono underline">
            I've saved it, dismiss
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="border border-border p-5 mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Create New Key</p>
        <div className="flex gap-3">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production API)"
            className="flex-1 bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={() => createKey.mutate(newKeyName.trim())}
            disabled={!newKeyName.trim() || createKey.isPending}
            className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            {createKey.isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </div>

      {/* Keys list */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : keys.length === 0 ? (
        <p className="text-muted-foreground text-sm">No API keys yet.</p>
      ) : (
        <div className="border border-border divide-y divide-border">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="font-medium text-sm">{key.name}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  {key.keyPrefix}•••••••• · {key.usageCount} uses ·{" "}
                  {key.lastUsedAt ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"} ·{" "}
                  Created {new Date(key.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => deleteKey.mutate(key.id)}
                disabled={deleteKey.isPending}
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Revoke key"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
