"use client"

import { useQuery } from "@tanstack/react-query"

interface WorkspaceStats {
  workspace: {
    id: string
    name: string
    plan: string
    aiCreditsUsed: number
    aiCreditsLimit: number
  }
  counts: {
    campaigns: number
    content: number
    contacts: number
    deals: number
    automations: number
    socialAccounts: number
  }
}

export function useWorkspaceStats() {
  return useQuery<WorkspaceStats>({
    queryKey: ["workspace-stats"],
    queryFn: async () => {
      const res = await fetch("/api/workspace/stats")
      if (!res.ok) throw new Error("Failed to load workspace stats")
      return res.json() as Promise<WorkspaceStats>
    },
    staleTime: 60_000,
  })
}
