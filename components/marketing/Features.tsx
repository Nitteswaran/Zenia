import { Bot, FileText, Share2, Users, Zap, BarChart3 } from "lucide-react"

const FEATURES = [
  {
    icon: Bot,
    title: "Zenia AI Agent",
    description:
      "Your autonomous marketing assistant. Tell it what you need — content, posts, campaigns, contacts — it executes. No prompting, just results.",
  },
  {
    icon: FileText,
    title: "AI Content Studio",
    description:
      "Every content type for every platform. Blog posts, LinkedIn threads, email sequences, ad copy, press releases — generated, refined, ready.",
  },
  {
    icon: Share2,
    title: "Social Media Hub",
    description:
      "Schedule across LinkedIn, Instagram, Facebook, Twitter, TikTok, and YouTube from one place. Drag-drop calendar. Best-time algorithm.",
  },
  {
    icon: Users,
    title: "Smart CRM",
    description:
      "Contacts, companies, deals, pipeline. AI lead scoring. Activity timelines. CSV import/export. Built for marketers, not just salespeople.",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description:
      "Visual workflow builder. Triggers, conditions, actions. Email sequences, Slack alerts, deal creation — all on autopilot.",
  },
  {
    icon: BarChart3,
    title: "Unified Analytics",
    description:
      "One dashboard for content, social, campaign, and CRM analytics. Date range filters. CSV export. White-label reports.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">Core Features</p>
        <h2 className="text-4xl md:text-5xl font-display font-black tracking-[-0.04em] mb-16 max-w-2xl">
          Everything marketing. Nothing else.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="bg-background p-8 hover:bg-muted/10 transition-colors">
                <Icon className="h-5 w-5 text-accent mb-5" strokeWidth={1.5} />
                <h3 className="font-display font-bold text-lg tracking-tight mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
