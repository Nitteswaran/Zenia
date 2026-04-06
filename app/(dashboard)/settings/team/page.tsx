"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Trash2, Shield } from "lucide-react"

interface Member {
  id: string
  role: "OWNER" | "ADMIN" | "MEMBER"
  createdAt: string
  user: { id: string; email: string; name: string | null; avatarUrl: string | null }
}

const ROLE_LABELS: Record<string, string> = { OWNER: "Owner", ADMIN: "Admin", MEMBER: "Member" }

export default function TeamPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER")

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["team"],
    queryFn: async () => {
      const res = await fetch("/api/team")
      if (!res.ok) throw new Error("Failed to load team")
      return res.json()
    },
  })

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] })
      setInviteEmail("")
      toast({ title: "Invitation sent" })
    },
    onError: (err) => toast({ title: err.message, variant: "destructive" }),
  })

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to remove member")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] })
      toast({ title: "Member removed" })
    },
    onError: (err) => toast({ title: err.message, variant: "destructive" }),
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error("Failed to update role")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] })
      toast({ title: "Role updated" })
    },
    onError: () => toast({ title: "Failed to update role", variant: "destructive" }),
  })

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Settings</p>
        <h1 className="text-3xl font-display font-bold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground mt-2">Invite teammates and manage their roles.</p>
      </div>

      {/* Invite */}
      <div className="border border-border p-5 mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Invite Member</p>
        <div className="flex gap-3">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            type="email"
            className="flex-1 bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER")}
            className="bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            onClick={() => inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole })}
            disabled={!inviteEmail.trim() || inviteMutation.isPending}
            className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
            {inviteMutation.isPending ? "Inviting…" : "Invite"}
          </button>
        </div>
      </div>

      {/* Members */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="border border-border divide-y divide-border">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 border border-border bg-muted flex items-center justify-center text-xs font-mono uppercase">
                  {(m.user.name ?? m.user.email)[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{m.user.name ?? m.user.email}</p>
                  {m.user.name && <p className="text-xs text-muted-foreground font-mono">{m.user.email}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {m.role === "OWNER" ? (
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    <Shield className="h-3 w-3" strokeWidth={1.5} />
                    Owner
                  </div>
                ) : (
                  <select
                    value={m.role}
                    onChange={(e) => updateRoleMutation.mutate({ memberId: m.id, role: e.target.value })}
                    className="bg-input border border-border px-2 py-1 text-xs font-mono focus:outline-none"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                )}
                {m.role !== "OWNER" && (
                  <button
                    onClick={() => removeMutation.mutate(m.id)}
                    disabled={removeMutation.isPending}
                    className="text-muted-foreground hover:text-accent transition-colors"
                    aria-label="Remove member"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
