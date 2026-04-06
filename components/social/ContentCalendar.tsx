"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PLATFORM_CONFIG } from "@/lib/social/platforms"
import { cn } from "@/lib/utils"
import type { SocialPost } from "@prisma/client"

interface ContentCalendarProps {
  posts: SocialPost[]
  onPostClick?: (post: SocialPost) => void
  onAddPost?: (date: Date) => void
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { firstDay, daysInMonth }
}

export function ContentCalendar({ posts, onPostClick, onAddPost }: ContentCalendarProps) {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const { firstDay, daysInMonth } = getMonthDays(current.year, current.month)

  function prevMonth() {
    setCurrent((c) => {
      const m = c.month === 0 ? 11 : c.month - 1
      const y = c.month === 0 ? c.year - 1 : c.year
      return { year: y, month: m }
    })
  }

  function nextMonth() {
    setCurrent((c) => {
      const m = c.month === 11 ? 0 : c.month + 1
      const y = c.month === 11 ? c.year + 1 : c.year
      return { year: y, month: m }
    })
  }

  function getPostsForDay(day: number): SocialPost[] {
    return posts.filter((p) => {
      const d = p.scheduledAt ? new Date(p.scheduledAt) : p.publishedAt ? new Date(p.publishedAt) : null
      if (!d) return false
      return d.getFullYear() === current.year && d.getMonth() === current.month && d.getDate() === day
    })
  }

  const monthName = new Date(current.year, current.month).toLocaleString("default", { month: "long" })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold tracking-tight">
          {monthName} {current.year}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 border border-border hover:border-foreground/30 transition-colors">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button onClick={nextMonth} className="p-1.5 border border-border hover:border-foreground/30 transition-colors">
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-t border-border">
        {/* Empty cells before month starts */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-border min-h-[80px] bg-muted/20" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayPosts = getPostsForDay(day)
          const isToday =
            today.getFullYear() === current.year &&
            today.getMonth() === current.month &&
            today.getDate() === day

          return (
            <div
              key={day}
              className="border-r border-b border-border min-h-[80px] p-1.5 relative group cursor-pointer hover:bg-muted/10 transition-colors"
              onClick={() => onAddPost?.(new Date(current.year, current.month, day))}
            >
              <span
                className={cn(
                  "text-xs font-mono",
                  isToday ? "bg-accent text-foreground px-1" : "text-muted-foreground"
                )}
              >
                {day}
              </span>

              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 3).map((post) => {
                  const cfg = PLATFORM_CONFIG[post.platform as keyof typeof PLATFORM_CONFIG]
                  return (
                    <button
                      key={post.id}
                      onClick={(e) => { e.stopPropagation(); onPostClick?.(post) }}
                      className="w-full text-left px-1.5 py-0.5 text-[10px] truncate font-mono"
                      style={{ backgroundColor: `${cfg?.color ?? "#333"}22`, color: cfg?.color ?? "#999" }}
                    >
                      {cfg?.name ?? post.platform}
                    </button>
                  )
                })}
                {dayPosts.length > 3 && (
                  <p className="text-[10px] text-muted-foreground font-mono pl-1">+{dayPosts.length - 3} more</p>
                )}
              </div>

              {/* Add button on hover */}
              <span className="absolute bottom-1 right-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                + Add
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
