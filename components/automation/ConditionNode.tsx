"use client"

import { GitBranch, Trash2 } from "lucide-react"
import type { AutomationStep } from "@/types"

interface ConditionNodeProps {
  step: AutomationStep
  onChange: (updates: Partial<AutomationStep>) => void
  onRemove: () => void
}

export function ConditionNode({ step, onChange, onRemove }: ConditionNodeProps) {
  const conditions = step.conditions ?? []

  function addCondition() {
    onChange({
      conditions: [
        ...conditions,
        { field: "status", operator: "equals", value: "" },
      ],
    })
  }

  function updateCondition(i: number, key: string, value: unknown) {
    const next = conditions.map((c, idx) => (idx === i ? { ...c, [key]: value } : c))
    onChange({ conditions: next })
  }

  function removeCondition(i: number) {
    onChange({ conditions: conditions.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="border border-border border-dashed bg-card/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={step.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="bg-transparent text-sm font-medium focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addCondition}
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            + Condition
          </button>
          <button onClick={onRemove} className="text-muted-foreground hover:text-accent transition-colors">
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {conditions.length > 0 && (
        <div className="border-t border-border/50 p-4 space-y-2">
          {conditions.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <input
                value={c.field}
                onChange={(e) => updateCondition(i, "field", e.target.value)}
                placeholder="field"
                className="bg-input border border-border px-2 py-1 text-xs w-28 focus:outline-none"
              />
              <select
                value={c.operator}
                onChange={(e) => updateCondition(i, "operator", e.target.value)}
                className="bg-input border border-border px-2 py-1 text-xs focus:outline-none"
              >
                {["equals", "not_equals", "contains", "greater_than", "less_than"].map((op) => (
                  <option key={op} value={op}>{op.replace(/_/g, " ")}</option>
                ))}
              </select>
              <input
                value={String(c.value)}
                onChange={(e) => updateCondition(i, "value", e.target.value)}
                placeholder="value"
                className="bg-input border border-border px-2 py-1 text-xs flex-1 focus:outline-none"
              />
              <button onClick={() => removeCondition(i)} className="text-muted-foreground hover:text-accent transition-colors text-xs">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
