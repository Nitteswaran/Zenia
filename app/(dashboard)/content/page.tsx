import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { formatRelativeDate } from "@/lib/utils"
import { Plus, FileText, Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContentDeleteButton } from "@/components/content/ContentDeleteButton"

export const metadata: Metadata = {
  title: "Content Studio — Zenia",
  description: "Your AI-powered content library. Every piece of content, every platform.",
}

const contentTypeLabels: Record<string, string> = {
  BLOG_POST: "Blog", EMAIL: "Email", SOCIAL_MEDIA: "Social", AD_COPY: "Ad",
  VIDEO_SCRIPT: "Video", NEWSLETTER: "Newsletter", PRESS_RELEASE: "Press Release",
}

const platformLabels: Record<string, string> = {
  LINKEDIN: "LinkedIn", TWITTER: "X", INSTAGRAM: "Instagram", FACEBOOK: "Facebook",
  TIKTOK: "TikTok", YOUTUBE: "YouTube", EMAIL: "Email", WEB: "Web",
}

export default async function ContentPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const content = await prisma.content.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-px w-12 bg-accent mb-3" />
          <h1 className="font-display text-3xl font-medium tracking-tight">Content Studio</h1>
          <p className="text-muted-foreground mt-1 text-sm">{content.length} pieces in your library</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" asChild>
            <Link href="/content/generate">
              <Bot className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Generate with AI
            </Link>
          </Button>
        </div>
      </div>

      {content.length === 0 ? (
        <div className="border border-border bg-card flex flex-col items-center justify-center py-24 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1} />
          <h2 className="font-display text-xl font-medium mb-2">No content yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">Generate your first piece of AI-powered content. Blog posts, emails, social media captions, and more.</p>
          <Button variant="secondary" asChild>
            <Link href="/content/generate">
              <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Generate Content
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border border-border">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-border bg-muted">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Title</p>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Type</p>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Status</p>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Created</p>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground sr-only">Actions</p>
          </div>
          {content.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center group">
              <Link href={`/content/${item.id}`} className="min-w-0 block">
                <p className="text-sm font-medium truncate hover:text-accent transition-colors">{item.title}</p>
                {item.platform && <p className="text-xs text-muted-foreground font-mono mt-0.5">{platformLabels[item.platform] ?? item.platform}</p>}
              </Link>
              <Badge variant="secondary">{contentTypeLabels[item.type] ?? item.type}</Badge>
              <Badge variant={item.status === "PUBLISHED" ? "success" : item.status === "DRAFT" ? "outline" : "secondary"}>
                {item.status}
              </Badge>
              <p className="text-xs text-muted-foreground font-mono whitespace-nowrap">{formatRelativeDate(item.createdAt)}</p>
              <ContentDeleteButton id={item.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
