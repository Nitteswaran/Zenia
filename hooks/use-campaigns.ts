"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Campaign, CampaignAnalytics } from "@prisma/client"

type CampaignWithAnalytics = Campaign & { analytics: CampaignAnalytics | null; _count: { content: number; socialPosts: number } }

export function useCampaigns() {
  return useQuery<CampaignWithAnalytics[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns")
      if (!res.ok) throw new Error("Failed to load campaigns")
      return res.json() as Promise<CampaignWithAnalytics[]>
    },
  })
}

export function useCampaign(id: string) {
  return useQuery<CampaignWithAnalytics>({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${id}`)
      if (!res.ok) throw new Error("Failed to load campaign")
      return res.json() as Promise<CampaignWithAnalytics>
    },
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Campaign>) => {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      return res.json() as Promise<Campaign>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  })
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Campaign>) => {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      return res.json() as Promise<Campaign>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] })
      qc.invalidateQueries({ queryKey: ["campaigns", id] })
    },
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete campaign")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  })
}
