"use client"

import { useState } from "react"
import { ContactTable } from "@/components/crm/ContactTable"
import { useCreateContact } from "@/hooks/use-contacts"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

export default function ContactsPage() {
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const createContact = useCreateContact()

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", title: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email) return
    try {
      await createContact.mutateAsync(form)
      toast({ title: "Contact added" })
      setForm({ firstName: "", lastName: "", email: "", phone: "", title: "" })
      setShowForm(false)
    } catch (err) {
      toast({ title: "Failed to add contact", description: String(err), variant: "destructive" })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">CRM</p>
        <h1 className="text-3xl font-display font-bold tracking-tight">Contacts</h1>
      </div>

      <ContactTable onAddContact={() => setShowForm(true)} />

      {/* Quick add slide-over */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-md border-l border-border bg-card p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-display font-bold tracking-tight">Add Contact</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {([
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["email", "Email *"],
                ["phone", "Phone"],
                ["title", "Job Title"],
              ] as [keyof typeof form, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
                  <input
                    type={key === "email" ? "email" : "text"}
                    required={key === "email"}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={createContact.isPending || !form.email}
                className="w-full bg-foreground text-background py-3 text-xs font-mono uppercase tracking-wider hover:bg-foreground/90 transition-colors disabled:opacity-50 mt-4"
              >
                {createContact.isPending ? "Adding…" : "Add Contact"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
