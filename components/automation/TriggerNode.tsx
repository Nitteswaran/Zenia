"use client"

import { Zap, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { AutomationTrigger, TriggerType } from "@/types"

const TRIGGER_OPTIONS: { type: TriggerType; label: string; description: string; group?: string }[] = [
  // CRM — Contact
  { type: "contact_created", label: "New Contact Added", description: "Fires when a contact is created in the CRM", group: "CRM" },
  { type: "tag_added", label: "Tag Added to Contact", description: "Fires when a specific tag is applied", group: "CRM" },
  { type: "lead_score_threshold", label: "Lead Score Threshold Crossed", description: "Fires when a contact's score crosses a threshold (e.g. becomes hot ≥65)", group: "CRM" },
  { type: "crm_inactivity", label: "CRM Inactivity", description: "Fires when a contact has had no interaction for a set period", group: "CRM" },
  // CRM — Deals
  { type: "deal_stage_changed", label: "Deal Stage Changed", description: "Fires when a deal moves to a new pipeline stage", group: "Deals" },
  // Campaigns & Content
  { type: "campaign_started", label: "Campaign Launched", description: "Fires when a campaign goes active", group: "Marketing" },
  { type: "content_published", label: "Content Published", description: "Fires when content is published", group: "Marketing" },
  { type: "form_submitted", label: "Form Submitted", description: "Fires when a web form is submitted", group: "Marketing" },
  // Schedule
  { type: "scheduled", label: "Scheduled (Cron)", description: "Fires on a recurring schedule", group: "Schedule" },
]

interface TriggerNodeProps {
  trigger: AutomationTrigger
  onChange: (trigger: AutomationTrigger) => void
}

export function TriggerNode({ trigger, onChange }: TriggerNodeProps) {
  const [open, setOpen] = useState(false)
  const current = TRIGGER_OPTIONS.find((t) => t.type === trigger.type)

  return (
    <div className="border border-accent/40 bg-accent/5 p-4 relative">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent">Trigger</span>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <p className="font-medium text-sm">{current?.label ?? "Select trigger…"}</p>
          {current && <p className="text-xs text-muted-foreground mt-0.5">{current.description}</p>}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="mt-3 border border-border bg-card">
          {Array.from(new Set(TRIGGER_OPTIONS.map((o) => o.group))).map((group) => (
            <div key={group}>
              <div className="px-4 py-1.5 bg-muted/30 border-b border-border/50">
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{group}</p>
              </div>
              {TRIGGER_OPTIONS.filter((o) => o.group === group).map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => { onChange({ type: opt.type }); setOpen(false) }}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0",
                    trigger.type === opt.type && "bg-accent/5"
                  )}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Scheduled cron config */}
      {trigger.type === "scheduled" && (
        <div className="mt-3">
          <select
            value={(trigger.config?.schedule as string) ?? "daily"}
            onChange={(e) => onChange({ ...trigger, config: { schedule: e.target.value } })}
            className="w-full bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="daily">Every day at 9am</option>
            <option value="weekly">Every Monday at 9am</option>
            <option value="monthly">First day of month</option>
          </select>
        </div>
      )}

      {/* Lead score threshold config */}
      {trigger.type === "lead_score_threshold" && (
        <div className="mt-3 space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Score Threshold (fires when score ≥ this value)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={(trigger.config?.threshold as number) ?? 65}
            onChange={(e) => onChange({ ...trigger, config: { threshold: parseInt(e.target.value, 10) } })}
            className="w-full bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-[10px] text-muted-foreground">Default: 65 (hot lead threshold)</p>
        </div>
      )}

      {/* CRM inactivity config */}
      {trigger.type === "crm_inactivity" && (
        <div className="mt-3 space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Days of Inactivity</label>
          <input
            type="number"
            min={1}
            value={(trigger.config?.inactiveDays as number) ?? 30}
            onChange={(e) => onChange({ ...trigger, config: { inactiveDays: parseInt(e.target.value, 10) } })}
            className="w-full bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-[10px] text-muted-foreground">Fires when a contact&apos;s last interaction is older than this many days</p>
        </div>
      )}
    </div>
  )
}
