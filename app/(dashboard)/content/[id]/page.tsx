"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, Trash2, Check } from "lucide-react"
import Link from "next/link"

interface ContentItem {
  id: string
  title: string
  body: string
  type: string
  platform: string | null
  status: string
  aiGenerated: boolean
  tags: string[]
  campaign: { id: string; name: string } | null
  socialPosts: { id: string; platform: string; status: string; publishedAt: string | null }[]
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<{ title?: string; body?: string; status?: string }>({})
  const [copied, setCopied] = useState(false)

  const { data: content, isLoading } = useQuery<ContentItem>({
    queryKey: ["content", id],
    queryFn: async () => {
      const res = await fetch(`/api/content/${id}`)
      if (!res.ok) throw new Error("Failed to load content")
      return res.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content", id] })
      setEditing(false)
      setForm({})
      toast({ title: "Content updated" })
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/content/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
    },
    onSuccess: () => {
      router.push("/content")
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  })

  function copyContent() {
    if (!content) return
    navigator.clipboard.writeText(content.body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: "Copied to clipboard" })
    })
  }

  if (isLoading) return <div className="p-6 text-muted-foreground text-sm">Loading…</div>
  if (!content) return <div className="p-6 text-muted-foreground text-sm">Content not found.</div>

  const merged = { ...content, ...form }

  return (
    <div className="p-6 max-w-4xl">
      <Link
        href="/content"
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
        Content Studio
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 pr-6">
          {editing ? (
            <input
              value={merged.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-input border border-border px-3 py-2 text-2xl font-display font-bold focus:outline-none focus:ring-1 focus:ring-ring"
            />
          ) : (
            <h1 className="text-3xl font-display font-bold tracking-tight">{content.title}</h1>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider border border-border px-2 py-0.5 text-muted-foreground">{content.type.replace(/_/g, " ")}</span>
            {content.platform && (
              <span className="text-[10px] font-mono uppercase tracking-wider border border-border px-2 py-0.5 text-muted-foreground">{content.platform}</span>
            )}
            {content.aiGenerated && (
              <span className="text-[10px] font-mono uppercase tracking-wider border border-accent/40 bg-accent/5 px-2 py-0.5 text-accent">AI Generated</span>
            )}
            {editing ? (
              <select
                value={merged.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="bg-input border border-border px-2 py-0.5 text-xs font-mono uppercase focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-wider border border-border px-2 py-0.5 text-muted-foreground">{content.status}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyContent}
            className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
          >
            {copied ? <Check className="h-3 w-3" strokeWidth={1.5} /> : <Copy className="h-3 w-3" strokeWidth={1.5} />}
            {copied ? "Copied" : "Copy"}
          </button>
          {editing ? (
            <>
              <button
                onClick={() => { setEditing(false); setForm({}) }}
                className="border border-border px-3 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate(form)}
                disabled={updateMutation.isPending}
                className="border border-foreground bg-foreground text-background px-3 py-2 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="border border-border px-3 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => { if (confirm("Delete this content?")) deleteMutation.mutate() }}
            disabled={deleteMutation.isPending}
            className="border border-border px-3 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="border border-border mb-6">
        {editing ? (
          <textarea
            value={merged.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="w-full bg-input px-5 py-5 text-sm leading-relaxed focus:outline-none resize-none min-h-[400px] font-mono"
          />
        ) : (
          <div className="px-5 py-5 text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {content.body}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-6">
        {content.campaign && (
          <div className="border border-border p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Campaign</p>
            <Link href={`/campaigns/${content.campaign.id}`} className="text-sm hover:text-accent transition-colors">
              {content.campaign.name}
            </Link>
          </div>
        )}

        {content.tags.length > 0 && (
          <div className="border border-border p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {content.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono uppercase tracking-wider border border-border px-2 py-0.5 text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {content.socialPosts.length > 0 && (
          <div className="border border-border p-4 col-span-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Social Posts</p>
            <div className="space-y-2">
              {content.socialPosts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{p.platform}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase border border-border px-2 py-0.5 text-muted-foreground">{p.status}</span>
                    {p.publishedAt && (
                      <span className="text-xs text-muted-foreground">{new Date(p.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground font-mono">
        <span>Created {new Date(content.createdAt).toLocaleDateString()}</span>
        <span>Updated {new Date(content.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
