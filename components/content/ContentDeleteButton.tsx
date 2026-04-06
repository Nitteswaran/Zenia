"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ContentDeleteButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Delete this content? This cannot be undone.")) return

    setPending(true)
    try {
      const res = await fetch(`/api/content/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      router.refresh()
    } catch {
      toast({ variant: "destructive", title: "Failed to delete content" })
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-accent disabled:opacity-50"
      aria-label="Delete content"
    >
      {pending
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
        : <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
      }
    </button>
  )
}
