"use client"

import { cn } from "@/lib/utils"

interface UsageBarProps {
  label: string
  used: number
  limit: number
  unit?: string
  className?: string
}

export function UsageBar({ label, used, limit, unit = "", className }: UsageBarProps) {
  const unlimited = limit === -1
  const percent = unlimited ? 0 : Math.min(100, (used / limit) * 100)
  const isWarning = !unlimited && percent >= 80
  const isFull = !unlimited && percent >= 100

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={cn(isFull ? "text-accent" : isWarning ? "text-accent" : "text-muted-foreground")}>
          {unlimited
            ? "Unlimited"
            : `${used.toLocaleString()}${unit} / ${limit.toLocaleString()}${unit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1 w-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              isFull ? "bg-accent" : isWarning ? "bg-accent/70" : "bg-foreground/40"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}
