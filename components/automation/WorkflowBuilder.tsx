"use client"

import { useState } from "react"
import { Plus, Save, Play, Pause, ChevronDown } from "lucide-react"
import { TriggerNode } from "./TriggerNode"
import { ActionNode } from "./ActionNode"
import { ConditionNode } from "./ConditionNode"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { AutomationStep, AutomationTrigger } from "@/types"

interface WorkflowBuilderProps {
  automationId?: string
  initialName?: string
  initialTrigger?: AutomationTrigger
  initialSteps?: AutomationStep[]
  initialStatus?: string
  onSave?: (data: { name: string; trigger: AutomationTrigger; steps: AutomationStep[] }) => void
}

const STEP_TYPES: { type: AutomationStep["type"]; label: string }[] = [
  { type: "send_email", label: "Send Email" },
  { type: "generate_content", label: "Generate Content" },
  { type: "schedule_post", label: "Schedule Post" },
  { type: "add_contact", label: "Add Contact" },
  { type: "create_deal", label: "Create Deal" },
  { type: "send_slack", label: "Send Slack" },
  { type: "webhook", label: "Call Webhook" },
  { type: "add_tag", label: "Add Tag" },
  { type: "wait", label: "Wait" },
]

export function WorkflowBuilder({
  automationId,
  initialName = "New Workflow",
  initialTrigger,
  initialSteps = [],
  initialStatus = "INACTIVE",
  onSave,
}: WorkflowBuilderProps) {
  const { toast } = useToast()
  const [name, setName] = useState(initialName)
  const [trigger, setTrigger] = useState<AutomationTrigger>(
    initialTrigger ?? { type: "contact_created" }
  )
  const [steps, setSteps] = useState<AutomationStep[]>(initialSteps)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState(initialStatus)
  const [isActivating, setIsActivating] = useState(false)

  function addStep(type: AutomationStep["type"]) {
    const newStep: AutomationStep = {
      id: `step-${Date.now()}`,
      type,
      name: STEP_TYPES.find((s) => s.type === type)?.label ?? type,
      config: {},
    }
    setSteps((s) => [...s, newStep])
    setShowAddMenu(false)
  }

  function updateStep(id: string, updates: Partial<AutomationStep>) {
    setSteps((s) => s.map((step) => (step.id === id ? { ...step, ...updates } : step)))
  }

  function removeStep(id: string) {
    setSteps((s) => s.filter((step) => step.id !== id))
  }

  async function handleToggleStatus() {
    if (!automationId) {
      toast({ title: "Save the workflow first before activating", variant: "destructive" })
      return
    }
    const newStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    setIsActivating(true)
    try {
      const res = await fetch(`/api/automation/${automationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      setStatus(newStatus)
      toast({ title: newStatus === "ACTIVE" ? "Workflow activated" : "Workflow deactivated" })
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" })
    } finally {
      setIsActivating(false)
    }
  }

  async function handleSave() {
    if (steps.length === 0) {
      toast({ title: "Add at least one step", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      await onSave?.({ name, trigger, steps })
      toast({ title: "Workflow saved" })
    } catch {
      toast({ title: "Failed to save workflow", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent text-xl font-display font-bold tracking-tight focus:outline-none border-b border-transparent focus:border-border pb-1 w-full max-w-sm"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider hover:border-foreground/50 transition-colors disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={isActivating}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50",
              status === "ACTIVE"
                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                : "bg-foreground text-background hover:bg-foreground/90"
            )}
          >
            {status === "ACTIVE"
              ? <><Pause className="h-3.5 w-3.5" strokeWidth={1.5} />{isActivating ? "Deactivating…" : "Deactivate"}</>
              : <><Play className="h-3.5 w-3.5" strokeWidth={1.5} />{isActivating ? "Activating…" : "Activate"}</>
            }
          </button>
        </div>
      </div>

      {/* Workflow canvas */}
      <div className="space-y-3 max-w-lg">
        {/* Trigger */}
        <TriggerNode trigger={trigger} onChange={setTrigger} />

        {/* Arrow */}
        {steps.length > 0 && <div className="flex justify-center"><div className="w-px h-6 bg-border" /></div>}

        {/* Steps */}
        {steps.map((step, idx) => (
          <div key={step.id}>
            {step.type === "add_tag" || step.type === "add_contact" ? (
              <ConditionNode step={step} onChange={(u) => updateStep(step.id, u)} onRemove={() => removeStep(step.id)} />
            ) : (
              <ActionNode step={step} onChange={(u) => updateStep(step.id, u)} onRemove={() => removeStep(step.id)} />
            )}
            {idx < steps.length - 1 && (
              <div className="flex justify-center"><div className="w-px h-6 bg-border" /></div>
            )}
          </div>
        ))}

        {/* Add step */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-border" />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu((v) => !v)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-border py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Add Step
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAddMenu && "rotate-180")} strokeWidth={1.5} />
          </button>

          {showAddMenu && (
            <div className="absolute top-full left-0 right-0 z-10 border border-border bg-card mt-1">
              {STEP_TYPES.map((s) => (
                <button
                  key={s.type}
                  onClick={() => addStep(s.type)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/20 transition-colors border-b border-border/50 last:border-b-0"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
