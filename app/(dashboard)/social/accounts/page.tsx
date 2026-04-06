"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AccountCard } from "@/components/social/AccountCard"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { SocialAccount } from "@prisma/client"

export default function AccountsPage() {
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data: accounts = [], isLoading } = useQuery<SocialAccount[]>({
    queryKey: ["social-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/social/accounts")
      if (!res.ok) throw new Error("Failed")
      return res.json() as Promise<SocialAccount[]>
    },
  })

  const disconnect = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/social/accounts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to disconnect")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-accounts"] })
      toast({ title: "Account disconnected" })
    },
    onError: () => toast({ title: "Failed to disconnect", variant: "destructive" }),
  })

  const PLATFORMS = [
    { id: "LINKEDIN", name: "LinkedIn" },
    { id: "INSTAGRAM", name: "Instagram" },
    { id: "FACEBOOK", name: "Facebook" },
    { id: "TWITTER", name: "Twitter / X" },
    { id: "TIKTOK", name: "TikTok" },
    { id: "YOUTUBE", name: "YouTube" },
  ]

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Social Media Hub</p>
        <h1 className="text-3xl font-display font-bold tracking-tight">Connected Accounts</h1>
      </div>

      {/* Connected accounts */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading accounts…</p>
      ) : accounts.length > 0 ? (
        <div className="space-y-2 mb-10">
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} onDisconnect={(id) => disconnect.mutate(id)} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm mb-10">No accounts connected yet.</p>
      )}

      {/* Connect new */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Connect a Platform</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                // OAuth flow — redirect to platform-specific OAuth route
                window.location.href = `/api/social/oauth/${p.id.toLowerCase()}`
              }}
              className="flex items-center gap-3 border border-border p-4 hover:border-foreground/30 transition-colors text-left"
            >
              <Plus className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
