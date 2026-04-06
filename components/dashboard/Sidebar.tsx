"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Bot, FileText, Megaphone, Share2, Users,
  Zap, BarChart3, Puzzle, UserCog, Settings, ChevronLeft,
  ChevronRight, CreditCard, Key, Building2, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  gradient?: boolean
  badge?: string
}

interface NavGroup {
  group: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    group: "WORKSPACE",
    items: [
      { label: "Command Centre", href: "/dashboard", icon: LayoutDashboard },
      { label: "Zenia AI", href: "/zenia-ai", icon: Bot, gradient: true },
    ],
  },
  {
    group: "MARKETING",
    items: [
      { label: "Content Studio", href: "/content", icon: FileText },
      { label: "Campaigns", href: "/campaigns", icon: Megaphone },
      { label: "Social Media Hub", href: "/social", icon: Share2 },
    ],
  },
  {
    group: "GROWTH",
    items: [
      { label: "CRM", href: "/crm", icon: Users },
      { label: "Automation", href: "/automation", icon: Zap },
    ],
  },
  {
    group: "INSIGHTS",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    group: "SETTINGS",
    items: [
      { label: "Integrations", href: "/integrations", icon: Puzzle },
      { label: "Team", href: "/team", icon: UserCog },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  plan?: string
  creditsUsed?: number
  creditsLimit?: number
  userAvatarInitials?: string
  userEmail?: string
  workspaceName?: string
}

export function Sidebar({
  collapsed,
  onToggle,
  plan = "FREE",
  creditsUsed = 0,
  creditsLimit = 25,
  userAvatarInitials = "?",
  workspaceName = "My Workspace",
}: SidebarProps) {
  const pathname = usePathname()
  const creditsPercent = Math.min((creditsUsed / creditsLimit) * 100, 100)
  const isNearLimit = creditsPercent >= 80

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300 ease-out",
        collapsed ? "w-[60px]" : "w-[260px]"
      )}
    >
      {/* Logo + Workspace */}
      <div className={cn("flex items-center border-b border-border", collapsed ? "justify-center p-3" : "gap-2 p-4")}>
        <Link
          href="/dashboard"
          aria-label="Go to dashboard"
          className={cn("shrink-0", collapsed ? "" : "")}
        >
          <Image
            src="/Zenia_logo_2.png"
            alt="Zenia"
            width={48}
            height={48}
            priority
            className="h-11 w-11 object-contain"
          />
        </Link>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-medium tracking-tight truncate">{workspaceName}</p>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider truncate">{plan}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV.map((group) => (
          <div key={group.group} className="mb-4">
            {!collapsed && (
              <p className="mb-1 px-2 text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground/60">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 text-sm transition-colors duration-150 relative group",
                    collapsed ? "justify-center" : "",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    item.gradient && !isActive && "hover:text-accent"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-accent" />
                  )}
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      item.gradient && "text-accent",
                      isActive && "text-foreground"
                    )}
                    strokeWidth={1.5}
                  />
                  {!collapsed && (
                    <span className={cn("truncate", item.gradient && "font-medium")}>{item.label}</span>
                  )}
                  {!collapsed && item.gradient && (
                    <Sparkles className="h-3 w-3 text-accent ml-auto" strokeWidth={1.5} />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: Credits + User */}
      {!collapsed && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className={cn("uppercase tracking-wider", isNearLimit ? "text-accent" : "text-muted-foreground")}>
                AI Credits
              </span>
              <span className={isNearLimit ? "text-accent" : "text-muted-foreground"}>
                {creditsUsed}/{creditsLimit}
              </span>
            </div>
            <div className="h-1 w-full bg-muted overflow-hidden">
              <div
                className={cn("h-full transition-all duration-300", isNearLimit ? "bg-accent" : "bg-foreground/40")}
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 shrink-0 bg-muted border border-border flex items-center justify-center text-xs font-mono font-medium">
              {userAvatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">Account</p>
            </div>
            <Link href="/settings">
              <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] h-6 w-6 border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  )
}
