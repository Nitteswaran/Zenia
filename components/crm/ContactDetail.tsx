"use client"

import { useState } from "react"
import { Mail, Phone, Building2, Briefcase, Tag, Sparkles, Flame, ThermometerSun, Snowflake, BrainCircuit } from "lucide-react"
import { ActivityTimeline } from "./ActivityTimeline"
import { SalesAssistantPanel } from "./SalesAssistantPanel"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Contact, Activity, Company } from "@prisma/client"

type ContactWithRelations = Contact & {
  company?: Company | null
  activities?: Activity[]
  scoreLabel?: string | null
  lifecycleStage?: string | null
  lastInteractionAt?: Date | null
}

interface ContactDetailProps {
  contact: ContactWithRelations
  onUpdate?: (data: Partial<Contact>) => void
}

const SCORE_ICON = (label: string | null | undefined) => {
  if (label === "hot") return <Flame className="h-3.5 w-3.5 text-green-400" strokeWidth={1.5} />
  if (label === "warm") return <ThermometerSun className="h-3.5 w-3.5 text-yellow-400" strokeWidth={1.5} />
  return <Snowflake className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
}

const SCORE_COLOR = (s: number) =>
  s >= 65 ? "text-green-400" : s >= 35 ? "text-yellow-400" : "text-muted-foreground"

export function ContactDetail({ contact, onUpdate }: ContactDetailProps) {
  const { toast } = useToast()
  const [tab, setTab] = useState<"overview" | "assistant" | "activities" | "notes">("overview")
  const [isGenerating, setIsGenerating] = useState(false)
  const [outreach, setOutreach] = useState("")

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "Unknown"
  const initials = [contact.firstName?.[0], contact.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?"

  async function generateOutreach() {
    setIsGenerating(true)
    setOutreach("")
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EMAIL",
          topic: `Personalized outreach email to ${fullName}${contact.company ? `, ${contact.company.name}` : ""}${contact.title ? `, ${contact.title}` : ""}. Lead score: ${contact.score}/100 (${contact.scoreLabel ?? "unscored"}). Tags: ${contact.tags.join(", ") || "none"}. Source: ${contact.source ?? "unknown"}.`,
          tone: "professional",
          length: "short",
        }),
      })
      let text = ""
      const reader = res.body?.getReader()
      const dec = new TextDecoder()
      outer: while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of dec.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue
          const d = line.slice(6)
          if (d === "[DONE]") break outer
          try {
            const parsed = JSON.parse(d) as { text?: string; error?: string }
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) text += parsed.text
          } catch { /**/ }
        }
      }
      setOutreach(text)
    } catch {
      toast({ title: "Generation failed", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "assistant", label: "AI Assistant" },
    { id: "activities", label: "Activities" },
    { id: "notes", label: "Notes" },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 bg-muted border border-border flex items-center justify-center text-lg font-mono font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold tracking-tight">{fullName}</h1>
          {contact.title && <p className="text-sm text-muted-foreground mt-0.5">{contact.title}</p>}
          {contact.company && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              {contact.company.name}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="border border-border px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {contact.status}
          </span>
          {/* Lead score badge */}
          <div className={cn("flex items-center gap-1.5 px-2 py-1 border text-[10px] font-mono",
            contact.scoreLabel === "hot" ? "border-green-400/30 bg-green-400/5" :
            contact.scoreLabel === "warm" ? "border-yellow-400/30 bg-yellow-400/5" :
            "border-border"
          )}>
            {SCORE_ICON(contact.scoreLabel)}
            <span className={SCORE_COLOR(contact.score)}>{contact.score}/100</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "pb-3 text-sm font-mono uppercase tracking-wider transition-colors relative flex items-center gap-1.5",
              tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.id === "assistant" && <BrainCircuit className="h-3 w-3" strokeWidth={1.5} />}
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-px bg-accent" />}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact info */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Contact Info</p>
            {contact.email && (
              <InfoRow icon={Mail} label="Email" value={contact.email} href={`mailto:${contact.email}`} />
            )}
            {contact.phone && (
              <InfoRow icon={Phone} label="Phone" value={contact.phone} href={`tel:${contact.phone}`} />
            )}
            {contact.title && <InfoRow icon={Briefcase} label="Title" value={contact.title} />}
            {contact.source && <InfoRow icon={Tag} label="Source" value={contact.source} />}
            {(contact as ContactWithRelations).lifecycleStage && (
              <InfoRow icon={Tag} label="Stage" value={(contact as ContactWithRelations).lifecycleStage!} />
            )}
            {contact.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {contact.tags.map((tag) => (
                  <span key={tag} className="border border-border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Personalized Outreach */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">AI Personalized Outreach</p>
            {outreach ? (
              <div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/20 border border-border p-4 max-h-52 overflow-y-auto">
                  {outreach}
                </pre>
                <button
                  onClick={generateOutreach}
                  disabled={isGenerating}
                  className="mt-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-accent" strokeWidth={1.5} />
                  Regenerate
                </button>
              </div>
            ) : (
              <button
                onClick={generateOutreach}
                disabled={isGenerating}
                className="flex items-center gap-2 border border-border px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors w-full justify-center"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                {isGenerating ? "Generating…" : "Generate Personalized Email (1 credit)"}
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "assistant" && (
        <SalesAssistantPanel contactId={contact.id} />
      )}

      {tab === "activities" && (
        <ActivityTimeline activities={contact.activities ?? []} />
      )}

      {tab === "notes" && (
        <div>
          {contact.notes ? (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
      <span className="text-muted-foreground w-16 text-xs font-mono uppercase tracking-wider shrink-0">{label}</span>
      {href ? (
        <a href={href} className="text-foreground hover:text-accent transition-colors truncate">{value}</a>
      ) : (
        <span className="text-foreground truncate">{value}</span>
      )}
    </div>
  )
}
