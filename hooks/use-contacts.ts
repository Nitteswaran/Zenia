"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Contact } from "@prisma/client"

interface ContactsResponse {
  data: Contact[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ContactsParams {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

export function useContacts(params: ContactsParams = {}) {
  const { search = "", status, page = 1, pageSize = 25 } = params
  const qs = new URLSearchParams({
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    page: String(page),
    pageSize: String(pageSize),
  }).toString()

  return useQuery<ContactsResponse>({
    queryKey: ["contacts", search, status, page, pageSize],
    queryFn: async () => {
      const res = await fetch(`/api/crm/contacts?${qs}`)
      if (!res.ok) throw new Error("Failed to load contacts")
      return res.json() as Promise<ContactsResponse>
    },
  })
}

export function useContact(id: string) {
  return useQuery<Contact>({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const res = await fetch(`/api/crm/contacts/${id}`)
      if (!res.ok) throw new Error("Contact not found")
      return res.json() as Promise<Contact>
    },
    enabled: !!id,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Contact>) => {
      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      return res.json() as Promise<Contact>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  })
}

export function useUpdateContact(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Contact>) => {
      const res = await fetch(`/api/crm/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] })
      qc.invalidateQueries({ queryKey: ["contacts", id] })
    },
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/crm/contacts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete contact")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  })
}
