import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserCog, Mail, Plus } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"

export const metadata: Metadata = { title: "Team — Zenia", description: "Manage your workspace team members." }

export default async function TeamPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  })

  const roleColors: Record<string, "success" | "secondary" | "warning" | "outline"> = {
    OWNER: "success", ADMIN: "warning", MEMBER: "outline", VIEWER: "secondary",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-px w-12 bg-accent mb-3" />
          <h1 className="font-display text-3xl font-medium tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1 text-sm">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="secondary"><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />Invite Member</Button>
      </div>

      <div className="border border-border">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 border-b border-border bg-muted">
          {["Member", "Role", "Joined", ""].map((h, i) => (
            <p key={i} className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{h}</p>
          ))}
        </div>
        {members.map((member: (typeof members)[number]) => (
          <div key={member.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-border last:border-0 items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-muted border border-border flex items-center justify-center text-xs font-mono font-medium shrink-0">
                {member.user.name?.charAt(0)?.toUpperCase() ?? member.user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{member.user.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
            </div>
            <Badge variant={roleColors[member.role] ?? "outline"}>{member.role}</Badge>
            <p className="text-xs text-muted-foreground font-mono whitespace-nowrap">{formatRelativeDate(member.createdAt)}</p>
            <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}
