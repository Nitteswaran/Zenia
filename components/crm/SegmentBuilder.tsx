"use client"

import { useState } from "react"
import { Plus, Trash2, Wand2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { SegmentCondition, SegmentFilters, SegmentOperator } from "@/types"

const FIELD_OPTIONS: { value: SegmentCondition["field"]; label: string }[] = [
  { value: "status", label: "Contact Status" },
  { value: "score", label: "Lead Score" },
  { value: "tags", label: "Tags" },
  { value: "source", label: "Source" },
  { value: "lifecycleStage", label: "Lifecycle Stage" },
  { value: "lastInteractionAt", label: "Last Interaction" },
  { value: "createdAt", label: "Created Date" },
  { value: "title", label: "Job Title" },
]

const OPERATOR_OPTIONS: Record<SegmentCondition["field"], { value: SegmentOperator; label: string }[]> = {
  status: [
    { value: "equals", label: "is" },
    { value: "not_equals", label: "is not" },
    { value: "in", label: "is any of" },
  ],
  score: [
    { value: "gte", label: "≥" },
    { value: "lte", label: "≤" },
    { value: "equals", label: "=" },
  ],
  tags: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "in", label: "contains any of" },
  ],
  source: [
    { value: "equals", label: "is" },
    { value: "not_equals", label: "is not" },
    { value: "contains", label: "contains" },
  ],
  lifecycleStage: [
    { value: "equals", label: "is" },
    { value: "not_equals", label: "is not" },
    { value: "in", label: "is any of" },
  ],
  lastInteractionAt: [
    { value: "within_days", label: "within last N days" },
    { value: "older_than_days", label: "older than N days" },
  ],
  createdAt: [
    { value: "within_days", label: "within last N days" },
    { value: "older_than_days", label: "older than N days" },
  ],
  title: [
    { value: "contains", label: "contains" },
    { value: "equals", label: "is exactly" },
  ],
  companyId: [
    { value: "equals", label: "is" },
    { value: "not_equals", label: "is not" },
  ],
}

const STATUS_VALUES = ["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CUSTOMER", "CHURNED"]
const LIFECYCLE_VALUES = ["awareness", "consideration", "decision", "retention"]

interface SegmentBuilderProps {
  filters: SegmentFilters
  onChange: (filters: SegmentFilters) => void
  disabled?: boolean
}

export function SegmentBuilder({ filters, onChange, disabled }: SegmentBuilderProps) {
  function addCondition() {
    onChange({
      ...filters,
      conditions: [
        ...filters.conditions,
        { field: "status", operator: "equals", value: "QUALIFIED" },
      ],
    })
  }

  function removeCondition(idx: number) {
    onChange({
      ...filters,
      conditions: filters.conditions.filter((_, i) => i !== idx),
    })
  }

  function updateCondition(idx: number, updates: Partial<SegmentCondition>) {
    const updated = filters.conditions.map((c, i) => (i === idx ? { ...c, ...updates } : c))
    onChange({ ...filters, conditions: updated })
  }

  return (
    <div className="space-y-3">
      {/* Logic toggle */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Match</span>
        <div className="flex border border-border">
          {(["AND", "OR"] as const).map((logic) => (
            <button
              key={logic}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...filters, logic })}
              className={cn(
                "px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors",
                filters.logic === logic
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {logic}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">conditions</span>
      </div>

      {/* Conditions */}
      {filters.conditions.map((cond, idx) => (
        <ConditionRow
          key={idx}
          condition={cond}
          disabled={disabled}
          onChange={(updates) => updateCondition(idx, updates)}
          onRemove={() => removeCondition(idx)}
        />
      ))}

      <button
        type="button"
        disabled={disabled}
        onClick={addCondition}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
        Add condition
      </button>
    </div>
  )
}

function ConditionRow({
  condition,
  onChange,
  onRemove,
  disabled,
}: {
  condition: SegmentCondition
  onChange: (updates: Partial<SegmentCondition>) => void
  onRemove: () => void
  disabled?: boolean
}) {
  const operators = OPERATOR_OPTIONS[condition.field] ?? []
  const isMulti = condition.operator === "in" || condition.operator === "not_in"
  const isNumeric = condition.field === "score" || condition.operator === "within_days" || condition.operator === "older_than_days"

  function handleFieldChange(field: SegmentCondition["field"]) {
    const defaultOp = OPERATOR_OPTIONS[field]?.[0]?.value ?? "equals"
    let defaultVal: string | number | string[] = ""
    if (field === "status") defaultVal = "QUALIFIED"
    if (field === "score") defaultVal = 50
    if (field === "lastInteractionAt" || field === "createdAt") defaultVal = 30
    onChange({ field, operator: defaultOp, value: defaultVal })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Field */}
      <select
        value={condition.field}
        disabled={disabled}
        onChange={(e) => handleFieldChange(e.target.value as SegmentCondition["field"])}
        className="bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[160px]"
      >
        {FIELD_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* Operator */}
      <select
        value={condition.operator}
        disabled={disabled}
        onChange={(e) => onChange({ operator: e.target.value as SegmentOperator })}
        className="bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {operators.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {/* Value */}
      {condition.field === "status" && !isMulti && (
        <select
          value={condition.value as string}
          disabled={disabled}
          onChange={(e) => onChange({ value: e.target.value })}
          className="bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {STATUS_VALUES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
      {condition.field === "status" && isMulti && (
        <MultiSelect
          options={STATUS_VALUES}
          value={Array.isArray(condition.value) ? (condition.value as string[]) : []}
          disabled={disabled}
          onChange={(v) => onChange({ value: v })}
        />
      )}
      {condition.field === "lifecycleStage" && !isMulti && (
        <select
          value={condition.value as string}
          disabled={disabled}
          onChange={(e) => onChange({ value: e.target.value })}
          className="bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {LIFECYCLE_VALUES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
      {(condition.field === "lifecycleStage" && isMulti) && (
        <MultiSelect
          options={LIFECYCLE_VALUES}
          value={Array.isArray(condition.value) ? (condition.value as string[]) : []}
          disabled={disabled}
          onChange={(v) => onChange({ value: v })}
        />
      )}
      {isNumeric && (
        <input
          type="number"
          min={0}
          value={condition.value as number}
          disabled={disabled}
          onChange={(e) => onChange({ value: parseInt(e.target.value, 10) || 0 })}
          className="bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-24"
        />
      )}
      {!isNumeric && condition.field !== "status" && condition.field !== "lifecycleStage" && (
        <input
          type="text"
          value={Array.isArray(condition.value) ? (condition.value as string[]).join(", ") : (condition.value as string)}
          placeholder={isMulti ? "value1, value2" : "value"}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value
            onChange({ value: isMulti ? v.split(",").map((s) => s.trim()).filter(Boolean) : v })
          }}
          className="bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[140px]"
        />
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className="text-muted-foreground hover:text-accent transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  )
}

function MultiSelect({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
  disabled?: boolean
}) {
  function toggle(opt: string) {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt))
    else onChange([...value, opt])
  }

  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => toggle(opt)}
          className={cn(
            "px-2 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors",
            value.includes(opt)
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted-foreground hover:border-foreground/30"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

/** Stand-alone button to trigger AI segment suggestions */
export function AiSegmentSuggest({
  onSuggestions,
}: {
  onSuggestions: (suggestions: Array<{ name: string; description: string; filters: SegmentFilters }>) => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSuggest() {
    setLoading(true)
    try {
      const res = await fetch("/api/crm/segments/suggest", { method: "POST" })
      if (!res.ok) throw new Error("Failed to generate suggestions")
      const data = await res.json() as Array<{ name: string; description: string; filters: SegmentFilters }>
      onSuggestions(data)
    } catch {
      toast({ title: "Failed to generate AI suggestions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSuggest}
      disabled={loading}
      className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} /> : <Wand2 className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />}
      {loading ? "Analysing…" : "AI Suggest Segments (1 credit)"}
    </button>
  )
}
