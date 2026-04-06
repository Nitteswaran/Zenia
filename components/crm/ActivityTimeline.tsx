"use client"

import { Phone, Mail, MessageSquare, Users, CheckSquare, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Activity } from "@prisma/client"

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  NOTE: { icon: MessageSquare, label: "Note", color: "text-muted-foreground" },
  CALL: { icon: Phone, label: "Call", color: "text-blue-400" },
  EMAIL: { icon: Mail, label: "Email", color: "text-green-400" },
  MEETING: { icon: Users, label: "Meeting", color: "text-purple-400" },
  TASK: { icon: CheckSquare, label: "Task", color: "text-yellow-400" },
}

interface ActivityTimelineProps {
  activities: Activity[]
  onAddActivity?: (type: string) => void
}

export function ActivityTimeline({ activities, onAddActivity }: ActivityTimelineProps) {
  const ACTIVITY_TYPES = Object.keys(TYPE_CONFIG)

  return (
    <div className="space-y-6">
      {/* Add activity buttons */}
      {onAddActivity && (
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map((t) => {
            const cfg = TYPE_CONFIG[t]
            const Icon = cfg.icon
            return (
              <button
                key={t}
                onClick={() => onAddActivity(t)}
                className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Icon className={cn("h-3 w-3", cfg.color)} strokeWidth={1.5} />
                {cfg.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Timeline */}
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activities yet.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {activities.map((activity) => {
              const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.NOTE
              const Icon = cfg.icon
              return (
                <div key={activity.id} className="flex gap-4 relative pl-6">
                  <div className={cn(
                    "absolute left-0 top-1 h-3.5 w-3.5 border border-border bg-card flex items-center justify-center",
                  )}>
                    <Icon className={cn("h-2 w-2", cfg.color)} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        <Clock className="h-2.5 w-2.5 inline mr-0.5" strokeWidth={1.5} />
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{activity.description}</p>
                    )}
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mt-1 inline-block">
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
