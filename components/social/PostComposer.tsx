"use client"

import { useState } from "react"
import { Send, Clock, Sparkles, AlertTriangle } from "lucide-react"
import { PLATFORM_CONFIG } from "@/lib/social/platforms"
import { PlatformPreview } from "./PlatformPreview"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const PLATFORMS = Object.keys(PLATFORM_CONFIG) as (keyof typeof PLATFORM_CONFIG)[]

interface PostComposerProps {
  onPublished?: () => void
}

export function PostComposer({ onPublished }: PostComposerProps) {
  const { toast } = useToast()
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["LINKEDIN"])
  const [caption, setCaption] = useState("")
  const [mode, setMode] = useState<"now" | "schedule">("now")
  const [scheduledAt, setScheduledAt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const activePlatform = selectedPlatforms[0] ?? "LINKEDIN"
  const limit = PLATFORM_CONFIG[activePlatform as keyof typeof PLATFORM_CONFIG]?.maxChars ?? 280
  const overLimit = caption.length > limit

  function togglePlatform(p: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  async function generateCaption() {
    if (!caption.trim()) {
      toast({ title: "Enter a topic first", description: "Type something in the caption to use as context", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SOCIAL_MEDIA",
          platform: activePlatform,
          topic: caption,
          tone: "professional",
          length: "short",
        }),
      })

      let generated = ""
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const json = JSON.parse(line.slice(6)) as { text: string }
              generated += json.text
            } catch {
              // ignore
            }
          }
        }
      }
      if (generated) setCaption(generated)
    } catch {
      toast({ title: "Generation failed", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSubmit() {
    if (!caption.trim()) return
    if (selectedPlatforms.length === 0) {
      toast({ title: "Select at least one platform", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      for (const platform of selectedPlatforms) {
        // Create the post first
        const createRes = await fetch("/api/social/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caption, platform, mediaUrls: [] }),
        })
        if (!createRes.ok) throw new Error("Failed to create post")
        const post = await createRes.json() as { id: string }

        if (mode === "schedule" && scheduledAt) {
          // Schedule it
          const schedRes = await fetch("/api/social/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId: post.id, scheduledAt: new Date(scheduledAt).toISOString() }),
          })
          if (!schedRes.ok) throw new Error("Failed to schedule post")
        }
      }

      toast({ title: mode === "schedule" ? "Post scheduled!" : "Post saved as draft" })
      setCaption("")
      onPublished?.()
    } catch (err) {
      toast({ title: "Failed to create post", description: String(err), variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Composer */}
      <div className="space-y-4">
        {/* Platform selector */}
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Platforms</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const cfg = PLATFORM_CONFIG[p]
              const selected = selectedPlatforms.includes(p)
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors",
                    selected ? "border-foreground text-foreground bg-foreground/5" : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {cfg.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Caption editor */}
        <div className="relative">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your post caption…"
            className={cn(
              "w-full min-h-[160px] resize-none bg-input border p-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-sans",
              overLimit ? "border-accent" : "border-border"
            )}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {overLimit && <AlertTriangle className="h-3.5 w-3.5 text-accent" />}
            <span className={cn("text-xs font-mono", overLimit ? "text-accent" : "text-muted-foreground")}>
              {caption.length}/{limit}
            </span>
          </div>
        </div>

        {/* AI generate */}
        <button
          onClick={generateCaption}
          disabled={isGenerating}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          {isGenerating ? "Generating…" : "Generate caption with AI (1 credit)"}
        </button>

        {/* Scheduling */}
        <div className="border border-border p-4 space-y-3">
          <div className="flex gap-4">
            {(["now", "schedule"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "text-xs font-mono uppercase tracking-wider transition-colors",
                  mode === m ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {m === "now" ? "Post Now" : "Schedule"}
              </button>
            ))}
          </div>
          {mode === "schedule" && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="bg-input border border-border px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ring"
            />
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !caption.trim() || overLimit}
          className="flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-mono uppercase tracking-wider hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {mode === "now" ? <Send className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          {isSubmitting ? "Saving…" : mode === "now" ? "Save as Draft" : "Schedule Post"}
        </button>
      </div>

      {/* Preview */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Preview</p>
        <PlatformPreview platform={activePlatform} caption={caption || "Your caption will appear here…"} />
      </div>
    </div>
  )
}
