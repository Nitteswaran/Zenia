const INTEGRATIONS = [
  { name: "LinkedIn", category: "Social" },
  { name: "Instagram", category: "Social" },
  { name: "Facebook", category: "Social" },
  { name: "Twitter / X", category: "Social" },
  { name: "TikTok", category: "Social" },
  { name: "YouTube", category: "Social" },
  { name: "HubSpot", category: "CRM" },
  { name: "Mailchimp", category: "Email" },
  { name: "Salesforce", category: "CRM" },
  { name: "Slack", category: "Comms" },
  { name: "Google Analytics", category: "Analytics" },
  { name: "Zapier", category: "Automation" },
  { name: "Notion", category: "Productivity" },
  { name: "Stripe", category: "Payments" },
]

export function IntegrationsShowcase() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">Integrations</p>
        <h2 className="text-4xl md:text-5xl font-display font-black tracking-[-0.04em] mb-6 max-w-2xl">
          Works with everything you already use.
        </h2>
        <p className="text-muted-foreground text-lg mb-16 max-w-xl">
          Connect your existing tools and Zenia orchestrates them all from a single dashboard.
        </p>

        <div className="flex flex-wrap gap-3">
          {INTEGRATIONS.map((item) => (
            <div key={item.name} className="border border-border px-4 py-2.5 flex items-center gap-3">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {item.category}
              </span>
            </div>
          ))}
          <div className="border border-dashed border-border px-4 py-2.5 flex items-center">
            <span className="text-sm text-muted-foreground font-mono">+ More via Zapier</span>
          </div>
        </div>
      </div>
    </section>
  )
}
