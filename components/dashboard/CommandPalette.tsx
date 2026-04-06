"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, LayoutDashboard, Bot, FileText, Megaphone, Share2, Users, Zap, BarChart3, Puzzle, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandItem {
  label: string
  href: string
  icon: React.ElementType
  group: string
  keywords?: string[]
}

const COMMANDS: CommandItem[] = [
  { label: "Command Centre", href: "/dashboard", icon: LayoutDashboard, group: "Navigation" },
  { label: "Zenia AI", href: "/zenia-ai", icon: Bot, group: "Navigation" },
  { label: "Content Studio", href: "/content", icon: FileText, group: "Navigation" },
  { label: "Generate Content", href: "/content/generate", icon: FileText, group: "Actions", keywords: ["create", "write", "blog", "post"] },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone, group: "Navigation" },
  { label: "New Campaign", href: "/campaigns/new", icon: Megaphone, group: "Actions" },
  { label: "Social Media Hub", href: "/social", icon: Share2, group: "Navigation" },
  { label: "Compose Post", href: "/social/compose", icon: Share2, group: "Actions", keywords: ["schedule", "post", "publish"] },
  { label: "Content Calendar", href: "/social/calendar", icon: Share2, group: "Navigation" },
  { label: "CRM", href: "/crm", icon: Users, group: "Navigation" },
  { label: "Contacts", href: "/crm/contacts", icon: Users, group: "Navigation", keywords: ["leads", "people"] },
  { label: "Deal Pipeline", href: "/crm/pipeline", icon: Users, group: "Navigation", keywords: ["deals", "kanban", "sales"] },
  { label: "Automation", href: "/automation", icon: Zap, group: "Navigation", keywords: ["workflow", "trigger"] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, group: "Navigation" },
  { label: "Integrations", href: "/integrations", icon: Puzzle, group: "Navigation" },
  { label: "Settings", href: "/settings", icon: Settings, group: "Settings" },
  { label: "Billing", href: "/settings/billing", icon: Settings, group: "Settings" },
]

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (!open) return
        onClose()
      }
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return COMMANDS.slice(0, 8)
    const q = query.toLowerCase()
    return COMMANDS.filter((cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.group.toLowerCase().includes(q) ||
      cmd.keywords?.some((k) => k.includes(q))
    ).slice(0, 8)
  }, [query])

  const grouped = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filtered.forEach((cmd) => {
      if (!groups[cmd.group]) groups[cmd.group] = []
      groups[cmd.group].push(cmd)
    })
    return groups
  }, [filtered])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div
        className="w-full max-w-xl border border-border bg-card shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages, contacts..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">{group}</p>
                {items.map((item) => (
                  <button
                    key={item.href}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-100"
                    onClick={() => { router.push(item.href); onClose() }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
          <span>ESC to close</span>
          <span>↵ to navigate</span>
        </div>
      </div>
    </div>
  )
}
