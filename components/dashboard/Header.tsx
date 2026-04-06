"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbSegment {
  label: string
  href?: string
}

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: BreadcrumbSegment[] = []

  const labelMap: Record<string, string> = {
    dashboard: "Command Centre",
    "zenia-ai": "Zenia AI",
    content: "Content Studio",
    generate: "Generate",
    campaigns: "Campaigns",
    new: "New",
    social: "Social Media Hub",
    compose: "Compose",
    calendar: "Calendar",
    accounts: "Accounts",
    crm: "CRM",
    contacts: "Contacts",
    companies: "Companies",
    pipeline: "Pipeline",
    automation: "Automation",
    analytics: "Analytics",
    integrations: "Integrations",
    team: "Team",
    settings: "Settings",
    billing: "Billing",
    "api-keys": "API Keys",
    workspace: "Workspace",
  }

  segments.forEach((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    crumbs.push({ label: labelMap[seg] ?? seg, href: i < segments.length - 1 ? href : undefined })
  })

  return crumbs
}

interface HeaderProps {
  userName?: string
  unreadNotifications?: number
}

export function Header({ userName, unreadNotifications = 0 }: HeaderProps) {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />}
            {crumb.href ? (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors duration-150">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Search hint */}
        <button
          className="hidden md:flex items-center gap-2 h-9 px-3 border border-border bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors duration-150"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="text-xs font-mono">⌘K</span>
        </button>

        {/* Notifications */}
        <Link
          href="/settings"
          className="relative h-9 w-9 flex items-center justify-center border border-border bg-transparent hover:bg-muted transition-colors duration-150"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-accent-foreground text-[10px] font-mono flex items-center justify-center">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </Link>

        {/* User */}
        <Link
          href="/settings"
          className="h-9 w-9 flex items-center justify-center bg-muted border border-border text-xs font-mono font-medium hover:bg-muted/80 transition-colors duration-150"
          aria-label="Profile settings"
        >
          {userName?.charAt(0).toUpperCase() ?? "?"}
        </Link>
      </div>
    </header>
  )
}
