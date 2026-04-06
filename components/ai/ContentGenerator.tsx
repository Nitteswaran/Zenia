"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contentGenerateSchema, type ContentGenerateFormData } from "@/lib/validations/schemas"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Copy, Check, Loader2, RefreshCw, Wand2, Library } from "lucide-react"
import { cn } from "@/lib/utils"

const CONTENT_TYPES = [
  { value: "BLOG_POST", label: "Blog Post" },
  { value: "EMAIL", label: "Email" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "AD_COPY", label: "Ad Copy" },
  { value: "VIDEO_SCRIPT", label: "Video Script" },
  { value: "NEWSLETTER", label: "Newsletter" },
  { value: "PRESS_RELEASE", label: "Press Release" },
]

const PLATFORMS = [
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "TWITTER", label: "X (Twitter)" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "EMAIL", label: "Email" },
  { value: "WEB", label: "Web" },
]

const TONES = ["Professional", "Casual", "Witty", "Bold", "Empathetic", "Authoritative", "Storytelling"]

const LENGTHS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
]

export function ContentGenerator() {
  const { toast } = useToast()
  const [output, setOutput] = React.useState("")
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [keywordInput, setKeywordInput] = React.useState("")

  const form = useForm<ContentGenerateFormData>({
    resolver: zodResolver(contentGenerateSchema),
    defaultValues: {
      type: "BLOG_POST",
      topic: "",
      tone: "Professional",
      length: "medium",
      keywords: [],
    },
  })

  const keywords = form.watch("keywords") ?? []

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const kw = keywordInput.trim()
      if (kw && !keywords.includes(kw)) {
        form.setValue("keywords", [...keywords, kw])
      }
      setKeywordInput("")
    }
  }

  const removeKeyword = (kw: string) => {
    form.setValue("keywords", keywords.filter((k) => k !== kw))
  }

  const onSubmit = async (data: ContentGenerateFormData) => {
    setOutput("")
    setIsStreaming(true)

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to generate")
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      let streamError: string | null = null

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6)
          if (payload === "[DONE]") break outer
          try {
            const parsed = JSON.parse(payload) as { text?: string; error?: string }
            if (parsed.error) { streamError = parsed.error; break outer }
            if (parsed.text) {
              accumulated += parsed.text
              setOutput(accumulated)
            }
          } catch { /* ignore malformed chunks */ }
        }
      }

      if (streamError) throw new Error(streamError)
      if (!accumulated) throw new Error("No content was generated. Check your API key in .env.local.")

      toast({ title: "Content saved", description: "View it in Content Studio → your library." })
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Failed to generate content" })
    } finally {
      setIsStreaming(false)
    }
  }

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Left: Inputs */}
      <div className="border border-border bg-card overflow-y-auto">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Configuration</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-5">
            {/* Content Type */}
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Content Type</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {CONTENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => field.onChange(t.value)}
                      className={cn(
                        "border px-3 py-2 text-xs font-mono uppercase tracking-wider text-left transition-colors duration-150",
                        field.value === t.value ? "border-foreground text-foreground bg-muted" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            {/* Platform */}
            <FormField control={form.control} name="platform" render={({ field }) => (
              <FormItem>
                <FormLabel>Platform (optional)</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    value={field.value ?? ""}
                    className="flex h-12 w-full border border-border bg-input px-4 text-sm text-foreground focus-visible:outline-none focus-visible:border-accent transition-colors"
                  >
                    <option value="">Any platform</option>
                    {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </FormControl>
              </FormItem>
            )} />

            {/* Topic */}
            <FormField control={form.control} name="topic" render={({ field }) => (
              <FormItem>
                <FormLabel>Topic / Brief</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="e.g. The future of AI in content marketing and how businesses can adapt..."
                    className="flex w-full border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent transition-colors resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Tone */}
            <FormField control={form.control} name="tone" render={({ field }) => (
              <FormItem>
                <FormLabel>Tone</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange(t)}
                      className={cn(
                        "border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors duration-150",
                        field.value === t ? "border-foreground text-foreground bg-muted" : "border-border text-muted-foreground hover:border-foreground/40"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </FormItem>
            )} />

            {/* Length */}
            <FormField control={form.control} name="length" render={({ field }) => (
              <FormItem>
                <FormLabel>Length</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  {LENGTHS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => field.onChange(l.value)}
                      className={cn(
                        "border py-2 text-xs font-mono uppercase tracking-wider transition-colors",
                        field.value === l.value ? "border-foreground text-foreground bg-muted" : "border-border text-muted-foreground hover:border-foreground/40"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </FormItem>
            )} />

            {/* Keywords */}
            <div className="space-y-2">
              <FormLabel>Keywords (optional)</FormLabel>
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={addKeyword}
                placeholder="Type keyword and press Enter..."
              />
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((kw) => (
                    <span key={kw} className="flex items-center gap-1.5 border border-border px-2 py-1 text-xs font-mono text-muted-foreground">
                      {kw}
                      <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-foreground">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Audience */}
            <FormField control={form.control} name="audience" render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience (optional)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="e.g. B2B SaaS marketing managers, 30-45 years old" />
                </FormControl>
              </FormItem>
            )} />

            <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={isStreaming}>
              {isStreaming ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><Wand2 className="h-4 w-4 mr-2" strokeWidth={1.5} /> Generate Content</>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Right: Output */}
      <div className="border border-border bg-card flex flex-col">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Output</p>
          <div className="flex gap-3 items-center">
            <Link href="/content" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Library className="h-3 w-3" strokeWidth={1.5} /> Library
            </Link>
            {output && (
              <>
                <button
                  onClick={() => { setOutput(""); form.reset() }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="h-3 w-3" strokeWidth={1.5} /> Reset
                </button>
                <button
                  onClick={copyOutput}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!output && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Wand2 className="h-8 w-8 text-muted-foreground mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">Configure your content on the left and click Generate.</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                {output}
                {isStreaming && <span className="inline-block w-0.5 h-4 bg-accent animate-pulse ml-0.5" />}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
