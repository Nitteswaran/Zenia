"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { campaignSchema, type CampaignFormData } from "@/lib/validations/schemas"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Wand2, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Basics", "Audience", "Channels", "Budget", "AI Brief", "Review"]

const CAMPAIGN_TYPES = ["EMAIL", "SOCIAL", "CONTENT", "SEO", "PAID", "MULTI_CHANNEL"]
const CHANNELS = ["LinkedIn", "Instagram", "Facebook", "Twitter", "TikTok", "YouTube", "Email", "SEO", "Paid Ads"]

export function CampaignWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = React.useState(0)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [brief, setBrief] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedChannels, setSelectedChannels] = React.useState<string[]>([])

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "", description: "", type: "MULTI_CHANNEL", goal: "", channels: [], budget: undefined,
    },
  })

  const toggleChannel = (ch: string) => {
    const next = selectedChannels.includes(ch)
      ? selectedChannels.filter((c) => c !== ch)
      : [...selectedChannels, ch]
    setSelectedChannels(next)
    form.setValue("channels", next)
  }

  const generateBrief = async () => {
    const data = form.getValues()
    setIsGenerating(true)
    setBrief("")

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CAMPAIGN_BRIEF",
          topic: `Campaign: "${data.name}". Goal: ${data.goal}. Channels: ${selectedChannels.join(", ") || "TBD"}.${data.description ? ` Target audience: ${data.description}.` : ""}${data.budget ? ` Budget: $${data.budget}.` : ""}`,
          tone: "Professional",
          length: "long",
        }),
      })

      if (!res.ok) throw new Error("Failed to generate brief")

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue
          const d = line.slice(6)
          if (d === "[DONE]") break outer
          try {
            const parsed = JSON.parse(d) as { text?: string; error?: string }
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) {
              accumulated += parsed.text
              setBrief(accumulated)
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "JSON") throw e
          }
        }
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Failed to generate campaign brief" })
    } finally {
      setIsGenerating(false)
    }
  }

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, channels: selectedChannels }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? "Failed to create campaign")
      }
      const campaign = await res.json() as { id: string }
      toast({ title: "Campaign created!" })
      router.push(`/campaigns/${campaign.id}`)
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "Failed to create campaign" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-border bg-card">
      {/* Progress */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "text-xs font-mono uppercase tracking-wider transition-colors",
                  i === step ? "text-foreground font-medium" : i < step ? "text-accent cursor-pointer" : "text-muted-foreground"
                )}
              >
                {s}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" strokeWidth={1.5} />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 h-0.5 w-full bg-muted overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6 space-y-5 min-h-[400px]">
            {/* Step 0: Basics */}
            {step === 0 && (
              <>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl><Input {...field} placeholder="Q2 Product Launch" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Type</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {CAMPAIGN_TYPES.map((t) => (
                        <button key={t} type="button" onClick={() => field.onChange(t)}
                          className={cn("border px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors",
                            field.value === t ? "border-foreground text-foreground bg-muted" : "border-border text-muted-foreground hover:border-foreground/40"
                          )}
                        >{t.replace("_", " ")}</button>
                      ))}
                    </div>
                  </FormItem>
                )} />
                <FormField control={form.control} name="goal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Goal</FormLabel>
                    <FormControl>
                      <textarea {...field} value={field.value ?? ""} rows={2} placeholder="e.g. Generate 500 leads for our new product launch by end of Q2..."
                        className="flex w-full border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent transition-colors resize-none"
                      />
                    </FormControl>
                  </FormItem>
                )} />
              </>
            )}

            {/* Step 1: Audience */}
            {step === 1 && (
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience Description</FormLabel>
                  <FormControl>
                    <textarea {...field} value={field.value ?? ""} rows={6}
                      placeholder="Describe your ideal customer: demographics, job title, industry, pain points, goals..."
                      className="flex w-full border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent transition-colors resize-none"
                    />
                  </FormControl>
                </FormItem>
              )} />
            )}

            {/* Step 2: Channels */}
            {step === 2 && (
              <FormItem>
                <FormLabel>Select Channels</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  {CHANNELS.map((ch) => (
                    <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                      className={cn("border px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors",
                        selectedChannels.includes(ch) ? "border-foreground text-foreground bg-muted" : "border-border text-muted-foreground hover:border-foreground/40"
                      )}
                    >{ch}</button>
                  ))}
                </div>
                {selectedChannels.length === 0 && <p className="text-xs text-muted-foreground mt-2">Select at least one channel</p>}
              </FormItem>
            )}

            {/* Step 3: Budget */}
            {step === 3 && (
              <div className="space-y-5">
                <FormField control={form.control} name="budget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget (USD, optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="5000" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            )}

            {/* Step 4: AI Brief */}
            {step === 4 && (
              <div className="space-y-4">
                {!brief && !isGenerating && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Wand2 className="h-8 w-8 text-muted-foreground mb-3" strokeWidth={1} />
                    <p className="text-sm text-muted-foreground mb-4">Ready to generate your AI campaign brief.</p>
                    <Button type="button" variant="secondary" onClick={generateBrief}>
                      <Wand2 className="h-4 w-4 mr-2" strokeWidth={1.5} />Generate Campaign Brief
                    </Button>
                  </div>
                )}
                {(brief || isGenerating) && (
                  <div className="border border-border bg-muted p-4 max-h-80 overflow-y-auto">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">AI Campaign Brief</p>
                    <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                      {brief}
                      {isGenerating && <span className="inline-block w-0.5 h-4 bg-accent animate-pulse ml-0.5" />}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-3">
                <div className="border border-border p-4 space-y-2">
                  {[
                    ["Name", form.getValues("name")],
                    ["Type", form.getValues("type")],
                    ["Goal", form.getValues("goal")],
                    ["Channels", selectedChannels.join(", ") || "None"],
                    ["Budget", form.getValues("budget") ? `$${form.getValues("budget")}` : "Not set"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                      <span className="text-muted-foreground font-mono text-xs uppercase tracking-wider">{label}</span>
                      <span className="font-medium text-right max-w-xs truncate">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="border-t border-border px-6 py-4 flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep((p) => p - 1)} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4 mr-1.5" strokeWidth={1.5} />Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" variant="secondary" onClick={() => setStep((p) => p + 1)}>
                Next<ChevronRight className="h-4 w-4 ml-1.5" strokeWidth={1.5} />
              </Button>
            ) : (
              <Button type="submit" variant="secondary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Launch Campaign
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
