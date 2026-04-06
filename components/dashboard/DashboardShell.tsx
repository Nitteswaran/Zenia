"use client"

import * as React from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Header } from "@/components/dashboard/Header"
import { CommandPalette } from "@/components/dashboard/CommandPalette"
import { UpgradeModal } from "@/components/billing/UpgradeModal"
import { Toaster } from "@/components/ui/toaster"
import { getInitials } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
  user?: { name?: string | null; email?: string | null } | null
  workspace?: { name?: string; plan?: string } | null
  creditsUsed?: number
  creditsLimit?: number
}

export function DashboardShell({ children, user, workspace, creditsUsed = 0, creditsLimit = 25 }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [cmdOpen, setCmdOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
        plan={workspace?.plan ?? "FREE"}
        creditsUsed={creditsUsed}
        creditsLimit={creditsLimit}
        userAvatarInitials={getInitials(user?.name ?? user?.email ?? "?")}
        workspaceName={workspace?.name ?? "My Workspace"}
      />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userName={user?.name ?? user?.email ?? "User"}
          unreadNotifications={0}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] p-6">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <UpgradeModal />
      <Toaster />
    </div>
  )
}
