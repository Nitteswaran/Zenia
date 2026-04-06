const STEPS = [
  {
    number: "01",
    title: "Connect your channels",
    description:
      "Link your social accounts, CRM, and marketing tools. Zenia syncs everything in minutes — no complex setup, no IT required.",
  },
  {
    number: "02",
    title: "Let Zenia understand your brand",
    description:
      "Define your brand voice, audience, and goals once. The AI uses this context across every piece of content it generates.",
  },
  {
    number: "03",
    title: "Watch it execute",
    description:
      "Zenia generates content, schedules posts, nurtures leads, and triggers workflows — autonomously, while you focus on strategy.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">How It Works</p>
        <h2 className="text-4xl md:text-5xl font-display font-black tracking-[-0.04em] mb-16">
          Three steps to full automation.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {STEPS.map((step) => (
            <div key={step.number} className="relative">
              <span className="text-[80px] font-display font-black text-border leading-none block mb-4 select-none">
                {step.number}
              </span>
              <h3 className="font-display font-bold text-xl tracking-tight mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
