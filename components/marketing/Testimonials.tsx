const TESTIMONIALS = [
  {
    quote:
      "We replaced 5 tools with Zenia in a week. The AI agent alone saves our team 15 hours a month on content creation.",
    author: "Sarah K.",
    role: "Head of Marketing, TechStack SaaS",
  },
  {
    quote:
      "The workflow automation is what won us over. New lead comes in, Zenia sends the email, scores them, and creates a deal. Zero manual work.",
    author: "Marcus T.",
    role: "Founder, B2B Consulting",
  },
  {
    quote:
      "Finally a platform that doesn't feel like it was built for an enterprise in 2015. Fast, smart, and the AI actually knows marketing.",
    author: "Priya M.",
    role: "Marketing Lead, DTC Brand",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">What People Say</p>
        <h2 className="text-4xl md:text-5xl font-display font-black tracking-[-0.04em] mb-16">
          Teams that replaced their stack.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {TESTIMONIALS.map((t) => (
            <div key={t.author} className="bg-background p-8">
              <blockquote className="text-base leading-relaxed mb-6 font-display italic text-muted-foreground">
                "{t.quote}"
              </blockquote>
              <div>
                <p className="font-medium text-sm">{t.author}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
