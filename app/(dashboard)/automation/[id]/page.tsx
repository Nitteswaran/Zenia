import { notFound } from "next/navigation"
import { getWorkspace } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { WorkflowBuilderClient } from "./WorkflowBuilderClient"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import type { AutomationTrigger, AutomationStep } from "@/types"

export default async function AutomationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ws = await getWorkspace()
  if (!ws) notFound()

  // "new" creates a fresh workflow
  if (id === "new") {
    return (
      <div className="p-6 max-w-3xl">
        <Link href="/automation" className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          All Automations
        </Link>
        <WorkflowBuilderClient workspaceId={ws.workspace.id} />
      </div>
    )
  }

  const automation = await prisma.automation.findFirst({
    where: { id, workspaceId: ws.workspace.id },
  })
  if (!automation) notFound()

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/automation" className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        All Automations
      </Link>
      <WorkflowBuilderClient
        automationId={automation.id}
        workspaceId={ws.workspace.id}
        initialName={automation.name}
        initialTrigger={automation.trigger as unknown as AutomationTrigger}
        initialSteps={automation.steps as unknown as AutomationStep[]}
        initialStatus={automation.status}
      />
    </div>
  )
}
