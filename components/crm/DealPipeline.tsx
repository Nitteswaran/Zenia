"use client"

import * as React from "react"
import type { Deal, Contact, Company } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

type DealWithRelations = Deal & { contact: Contact | null; company: Company | null }

const STAGES = [
  { key: "LEAD", label: "Lead" },
  { key: "QUALIFIED", label: "Qualified" },
  { key: "PROPOSAL", label: "Proposal" },
  { key: "NEGOTIATION", label: "Negotiation" },
  { key: "CLOSED_WON", label: "Closed Won" },
  { key: "CLOSED_LOST", label: "Closed Lost" },
] as const

type Stage = typeof STAGES[number]["key"]

interface DealPipelineProps {
  initialDeals: DealWithRelations[]
}

export function DealPipeline({ initialDeals }: DealPipelineProps) {
  const { toast } = useToast()
  const [deals, setDeals] = React.useState<DealWithRelations[]>(initialDeals)
  const [dragging, setDragging] = React.useState<string | null>(null)

  const dealsByStage = React.useMemo(() => {
    const map: Record<string, DealWithRelations[]> = {}
    STAGES.forEach(({ key }) => { map[key] = [] })
    deals.forEach((d) => { map[d.stage]?.push(d) })
    return map
  }, [deals])

  const stageTotal = (stage: string) =>
    dealsByStage[stage]?.reduce((a, d) => a + d.value, 0) ?? 0

  const handleDragStart = (dealId: string) => setDragging(dealId)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = async (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault()
    if (!dragging) return

    const prev = [...deals]
    setDeals((ds) => ds.map((d) => d.id === dragging ? { ...d, stage: targetStage } : d))
    setDragging(null)

    try {
      const res = await fetch(`/api/crm/deals/${dragging}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setDeals(prev)
      toast({ variant: "destructive", title: "Error", description: "Failed to update deal stage" })
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {STAGES.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col w-64 bg-card border border-border"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, key)}
          >
            {/* Column header */}
            <div className="px-3 py-3 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="text-sm font-medium mt-0.5">{formatCurrency(stageTotal(key))}</p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">{dealsByStage[key]?.length ?? 0}</span>
            </div>

            {/* Cards */}
            <div className="flex-1 flex flex-col gap-2 p-2 min-h-[400px]">
              {dealsByStage[key]?.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => handleDragStart(deal.id)}
                  className="border border-border bg-background p-3 cursor-grab active:cursor-grabbing hover:border-foreground/30 transition-colors duration-150 space-y-2"
                >
                  <p className="text-sm font-medium leading-tight">{deal.title}</p>
                  {deal.company && <p className="text-xs text-muted-foreground">{deal.company.name}</p>}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-medium text-accent">{formatCurrency(deal.value)}</p>
                    {deal.probability > 0 && (
                      <p className="text-xs font-mono text-muted-foreground">{deal.probability}%</p>
                    )}
                  </div>
                </div>
              ))}
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground/40 transition-colors w-full">
                <Plus className="h-3 w-3" strokeWidth={1.5} /> Add deal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
