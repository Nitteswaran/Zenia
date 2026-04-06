import { notFound } from "next/navigation"
import { getWorkspace } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { ContactDetail } from "@/components/crm/ContactDetail"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ws = await getWorkspace()
  if (!ws) notFound()

  const contact = await prisma.contact.findFirst({
    where: { id, workspaceId: ws.workspace.id },
    include: {
      company: true,
      deals: { include: { company: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  })
  if (!contact) notFound()

  return (
    <div className="p-6 max-w-4xl">
      <Link href="/crm/contacts" className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        All Contacts
      </Link>
      <ContactDetail contact={contact} />
    </div>
  )
}
