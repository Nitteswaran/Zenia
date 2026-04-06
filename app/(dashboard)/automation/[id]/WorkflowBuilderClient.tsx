"use client"

import { useRouter } from "next/navigation"
import { WorkflowBuilder } from "@/components/automation/WorkflowBuilder"
import { useToast } from "@/hooks/use-toast"
import type { AutomationTrigger, AutomationStep } from "@/types"

interface Props {
  automationId?: string
  workspaceId: string
  initialName?: string
  initialTrigger?: AutomationTrigger
  initialSteps?: AutomationStep[]
  initialStatus?: string
}

export function WorkflowBuilderClient({ automationId, workspaceId: _workspaceId, initialName, initialTrigger, initialSteps, initialStatus }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleSave(data: { name: string; trigger: AutomationTrigger; steps: AutomationStep[] }) {
    const url = automationId ? `/api/automation/${automationId}` : "/api/automation"
    const method = automationId ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json() as { error: string }
      throw new Error(err.error)
    }

    if (!automationId) {
      const created = await res.json() as { id: string }
      router.push(`/automation/${created.id}`)
    }

    toast({ title: "Workflow saved" })
  }

  return (
    <WorkflowBuilder
      automationId={automationId}
      initialName={initialName}
      initialTrigger={initialTrigger}
      initialSteps={initialSteps}
      initialStatus={initialStatus}
      onSave={handleSave}
    />
  )
}
