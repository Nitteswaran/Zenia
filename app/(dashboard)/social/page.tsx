import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { formatRelativeDate, formatDate } from "@/lib/utils"
import { Share2, Calendar, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = { title: "Social Media Hub — Zenia", description: "Manage all your social media accounts and posts." }

const platformColors: Record<string, string> = {
  LINKEDIN: "bg-blue-500/20 text-blue-400", INSTAGRAM: "bg-pink-500/20 text-pink-400",
  TWITTER: "bg-sky-500/20 text-sky-400", FACEBOOK: "bg-blue-600/20 text-blue-400",
  TIKTOK: "bg-foreground/10 text-foreground", YOUTUBE: "bg-red-500/20 text-red-400",
}

export default async function SocialPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const [accounts, posts] = await Promise.all([
    prisma.socialAccount.findMany({ where: { workspaceId: workspace.id, isActive: true } }),
    prisma.socialPost.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  const scheduledPosts = posts.filter(p => p.status === "SCHEDULED")
  const publishedPosts = posts.filter(p => p.status === "PUBLISHED")

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-px w-12 bg-accent mb-3" />
          <h1 className="font-display text-3xl font-medium tracking-tight">Social Media Hub</h1>
          <p className="text-muted-foreground mt-1 text-sm">{accounts.length} accounts connected · {scheduledPosts.length} posts scheduled</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild><Link href="/social/calendar"><Calendar className="h-4 w-4 mr-2" strokeWidth={1.5} />Calendar</Link></Button>
          <Button variant="secondary" asChild><Link href="/social/compose"><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />Compose</Link></Button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-medium tracking-tight">Connected Accounts</h2>
          <Link href="/social/accounts" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wider">Manage →</Link>
        </div>
        {accounts.length === 0 ? (
          <div className="border border-border border-dashed bg-card p-8 text-center">
            <Share2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
            <p className="text-sm font-medium mb-1">No accounts connected</p>
            <p className="text-xs text-muted-foreground mb-4">Connect LinkedIn, Instagram, Facebook, Twitter, TikTok, or YouTube</p>
            <Button variant="secondary" size="sm" asChild><Link href="/social/accounts">Connect Account</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {accounts.map((acc) => (
              <div key={acc.id} className="border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 ${platformColors[acc.platform] ?? "bg-muted text-muted-foreground"}`}>
                    {acc.platform}
                  </span>
                  <span className="h-2 w-2 bg-green-500 rounded-full" />
                </div>
                <p className="text-sm font-medium truncate">@{acc.accountName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="font-display text-lg font-medium tracking-tight mb-3">Recent Posts</h2>
        {posts.length === 0 ? (
          <div className="border border-border bg-card flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No posts yet. Compose your first post.</p>
          </div>
        ) : (
          <div className="border border-border divide-y divide-border">
            {posts.map((post) => (
              <div key={post.id} className="px-4 py-3 flex items-start gap-4">
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 shrink-0 ${platformColors[post.platform] ?? "bg-muted text-muted-foreground"}`}>
                  {post.platform}
                </span>
                <p className="text-sm text-muted-foreground flex-1 truncate">{post.caption}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={post.status === "PUBLISHED" ? "success" : post.status === "SCHEDULED" ? "secondary" : "outline"}>
                    {post.status}
                  </Badge>
                  {post.scheduledAt && <span className="text-xs font-mono text-muted-foreground">{formatDate(post.scheduledAt, "MMM d, h:mm a")}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
