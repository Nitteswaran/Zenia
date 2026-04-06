"use client"

import { useQuery } from "@tanstack/react-query"
import { ContentCalendar } from "@/components/social/ContentCalendar"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { SocialPost } from "@prisma/client"

interface PostsResponse { data: SocialPost[] }

export default function CalendarPage() {
  const { data } = useQuery<PostsResponse>({
    queryKey: ["social-posts"],
    queryFn: async () => {
      const res = await fetch("/api/social/posts?pageSize=200")
      if (!res.ok) throw new Error("Failed to load posts")
      return res.json() as Promise<PostsResponse>
    },
  })

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Social Media Hub</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">Content Calendar</h1>
        </div>
        <Link
          href="/social/compose"
          className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          New Post
        </Link>
      </div>
      <ContentCalendar posts={data?.data ?? []} onAddPost={() => window.location.href = "/social/compose"} />
    </div>
  )
}
