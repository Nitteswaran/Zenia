"use client"

import { useState } from "react"
import { Settings2, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AutomationStep } from "@/types"

interface ActionNodeProps {
  step: AutomationStep
  onChange: (updates: Partial<AutomationStep>) => void
  onRemove: () => void
}

const STEP_ICONS: Record<string, string> = {
  send_email: "✉️",
  generate_content: "✨",
  schedule_post: "📅",
  add_contact: "👤",
  create_deal: "💼",
  send_slack: "💬",
  webhook: "🔗",
  add_tag: "🏷️",
  wait: "⏱️",
}

export function ActionNode({ step, onChange, onRemove }: ActionNodeProps) {
  const [expanded, setExpanded] = useState(false)

  const icon = STEP_ICONS[step.type] ?? "⚙️"

  function updateConfig(key: string, value: unknown) {
    onChange({ config: { ...step.config, [key]: value } })
  }

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        <span className="text-base shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <input
            value={step.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="bg-transparent font-medium text-sm focus:outline-none w-full"
          />
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
            {step.type.replace(/_/g, " ")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setExpanded((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" strokeWidth={1.5} /> : <ChevronDown className="h-4 w-4" strokeWidth={1.5} />}
          </button>
          <button onClick={onRemove} className="text-muted-foreground hover:text-accent transition-colors">
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
            <Settings2 className="h-3 w-3" />
            Configuration
          </div>
          <StepConfig step={step} updateConfig={updateConfig} />
        </div>
      )}
    </div>
  )
}

function StepConfig({ step, updateConfig }: { step: AutomationStep; updateConfig: (k: string, v: unknown) => void }) {
  const cfg = step.config as Record<string, string>

  switch (step.type) {
    case "send_email":
      return (
        <div className="space-y-2">
          <ConfigField label="To (email or {{contact.email}})" value={cfg.to ?? ""} onChange={(v) => updateConfig("to", v)} />
          <ConfigField label="Subject (supports {{contact.firstName}})" value={cfg.subject ?? ""} onChange={(v) => updateConfig("subject", v)} />
          <ConfigTextarea label="Body (HTML, supports {{contact.firstName}})" value={cfg.html ?? ""} onChange={(v) => updateConfig("html", v)} />
        </div>
      )
    case "generate_content":
      return (
        <div className="space-y-2">
          <ConfigField label="Topic" value={cfg.topic ?? ""} onChange={(v) => updateConfig("topic", v)} />
          <ConfigField label="Type (BLOG_POST, EMAIL, etc.)" value={cfg.type ?? "SOCIAL_MEDIA"} onChange={(v) => updateConfig("type", v)} />
          <ConfigField label="Tone" value={cfg.tone ?? "professional"} onChange={(v) => updateConfig("tone", v)} />
        </div>
      )
    case "schedule_post":
      return (
        <div className="space-y-2">
          <ConfigTextarea label="Caption" value={cfg.caption ?? ""} onChange={(v) => updateConfig("caption", v)} />
          <ConfigField label="Platform" value={cfg.platform ?? "LINKEDIN"} onChange={(v) => updateConfig("platform", v)} />
          <ConfigField label="Scheduled At (ISO)" value={cfg.scheduledAt ?? ""} onChange={(v) => updateConfig("scheduledAt", v)} />
        </div>
      )
    case "send_slack":
      return (
        <div className="space-y-2">
          <ConfigField label="Webhook URL" value={cfg.webhookUrl ?? ""} onChange={(v) => updateConfig("webhookUrl", v)} />
          <ConfigField label="Message" value={cfg.message ?? ""} onChange={(v) => updateConfig("message", v)} />
        </div>
      )
    case "webhook":
      return (
        <div className="space-y-2">
          <ConfigField label="URL" value={cfg.url ?? ""} onChange={(v) => updateConfig("url", v)} />
          <ConfigField label="Method (POST/GET)" value={cfg.method ?? "POST"} onChange={(v) => updateConfig("method", v)} />
        </div>
      )
    case "wait":
      return (
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={cfg.duration ?? "1"}
            onChange={(e) => updateConfig("duration", parseInt(e.target.value, 10))}
            className="w-20 bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <select
            value={cfg.unit ?? "hours"}
            onChange={(e) => updateConfig("unit", e.target.value)}
            className="bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </select>
        </div>
      )
    case "add_tag":
      return <ConfigField label="Tag" value={cfg.tag ?? ""} onChange={(v) => updateConfig("tag", v)} />
    default:
      return (
        <p className="text-xs text-muted-foreground">No configuration needed for this step.</p>
      )
  }
}

function ConfigField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  )
}

function ConfigTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
      />
    </div>
  )
}
