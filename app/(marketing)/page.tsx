import type { Metadata } from "next"
import Link from "next/link"
import { getAuthUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  Bot, FileText, Megaphone, Share2, Users, Zap, BarChart3,
  ArrowRight, Check, ChevronDown
} from "lucide-react"

export const metadata: Metadata = {
  title: "Zenia — The AI Marketing Operating System",
  description: "One platform to generate content, manage campaigns, schedule social posts, nurture leads, and automate your entire marketing — powered by AI agents that actually work.",
}

const FEATURES = [
  { icon: Bot, title: "Zenia AI Agent", desc: "Your autonomous marketing assistant that executes — not just advises. Generate content, schedule posts, and run campaigns through conversation." },
  { icon: FileText, title: "AI Content Studio", desc: "Every content type for every platform. Blog posts, emails, social captions, ad copy, and more — in your brand voice." },
  { icon: Share2, title: "Social Media Hub", desc: "Schedule to all 6 platforms at once. Platform-accurate previews, content calendar, and best-time algorithms." },
  { icon: Users, title: "Smart CRM", desc: "Contacts, companies, deals, and a drag-and-drop pipeline. AI lead scoring and personalised outreach suggestions." },
  { icon: Zap, title: "Workflow Automation", desc: "Visual workflow builder. Trigger actions automatically — send emails, schedule posts, update contacts, notify the team." },
  { icon: BarChart3, title: "Unified Analytics", desc: "Every metric, every channel, one dashboard. Content performance, social analytics, campaign ROI, and CRM velocity." },
]

const TESTIMONIALS = [
  { quote: "Zenia replaced 6 tools and saved us 20 hours a week. The AI actually executes — it doesn't just advise.", name: "Sarah Chen", role: "Head of Marketing", company: "Vertex Labs" },
  { quote: "Our pipeline grew 40% in the first quarter using Zenia's CRM and automated outreach workflows. Incredible ROI.", name: "Marcus Rivera", role: "VP Sales & Marketing", company: "Clearpath SaaS" },
  { quote: "I'm a solo founder and Zenia gives me an entire marketing team in one tool. Publishing 5× more content with half the effort.", name: "Priya Nair", role: "Founder & CEO", company: "Loopflow" },
]

const FAQ = [
  { q: "Is there really no credit card required for the free plan?", a: "Correct. The free plan gives you 25 AI credits per month, 2 social accounts, and 20 content pieces — no card needed." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel your subscription at any time. No long-term contracts, no cancellation fees." },
  { q: "How do AI credits work?", a: "Each AI action (content generation, AI agent message) uses 1 credit. Credits reset monthly. You can also buy top-ups." },
  { q: "What social platforms does Zenia support?", a: "LinkedIn, Instagram, Facebook, Twitter/X, TikTok, and YouTube — with platform-specific previews in the composer." },
  { q: "Is Zenia right for enterprise teams?", a: "Absolutely. Enterprise plans include custom AI fine-tuning on your brand voice, dedicated infrastructure, SSO/SAML, and a dedicated CSM." },
  { q: "Can I connect my existing CRM?", a: "Yes. Zenia integrates with HubSpot, Salesforce, Mailchimp, Slack, Zapier, Google Analytics, and Notion." },
]

export default async function LandingPage() {
  const user = await getAuthUser()
  if (user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-[1200px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 bg-accent" />
          <span className="font-display text-xl font-medium tracking-tight">Zenia</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
          <Link href="/signup" className="border border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider hover:bg-foreground hover:text-background transition-all duration-150">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 py-24 md:py-36 lg:py-48">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-accent" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">AI Marketing Operating System</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-none mb-8">
            The only<br />
            marketing tool<br />
            <span className="text-accent">that executes.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            One platform to generate content, manage campaigns, schedule social posts, nurture leads, and automate your entire marketing — powered by AI agents that actually work.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:bg-accent/90 transition-colors"
            >
              Start for Free <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              Already have an account? Sign in →
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-8 text-xs font-mono text-muted-foreground">
            {["No credit card required", "Cancel anytime", "Setup in 2 minutes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><Check className="h-3 w-3 text-accent" strokeWidth={2} />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { stat: "10×", label: "Faster content creation" },
            { stat: "6+", label: "Tools replaced" },
            { stat: "40%", label: "Average pipeline growth" },
            { stat: "20hrs", label: "Saved per week" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-display text-4xl md:text-5xl font-medium text-accent tracking-tight">{item.stat}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-[1200px] mx-auto px-6 py-24 md:py-32">
        <div className="mb-16">
          <div className="h-px w-12 bg-accent mb-6" />
          <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight">Everything in one OS</h2>
          <p className="text-muted-foreground mt-4 max-w-lg">Stop duct-taping 10 tools together. Zenia replaces your entire marketing stack.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-border p-6 space-y-4 hover:border-foreground/30 hover:bg-muted/50 transition-all duration-150 group">
              <f.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
              <h3 className="font-display text-xl font-medium tracking-tight">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 py-24">
          <div className="mb-12">
            <div className="h-px w-12 bg-accent mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Connect your channels", desc: "Link your social accounts, CRM, email tools, and marketing integrations in minutes." },
              { num: "02", title: "Let Zenia learn your brand", desc: "Brief the AI on your brand voice, target audience, and marketing goals." },
              { num: "03", title: "Watch it execute", desc: "Zenia generates content, schedules posts, follows up leads, and runs reports — automatically." },
            ].map((step) => (
              <div key={step.num} className="space-y-4">
                <p className="font-display text-6xl font-medium text-muted-foreground/20 tracking-tightest">{step.num}</p>
                <h3 className="font-display text-xl font-medium tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1200px] mx-auto px-6 py-24 md:py-32">
        <div className="mb-12">
          <div className="h-px w-12 bg-accent mb-6" />
          <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight">Trusted by marketing teams</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="border border-border p-6 space-y-4">
              <div className="h-px w-8 bg-accent" />
              <blockquote className="text-base leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{t.role} · {t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 py-24">
          <div className="mb-12">
            <div className="h-px w-12 bg-accent mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-4">Start free. Scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { plan: "Free", price: "$0", period: "forever", credits: "25", features: ["20 content pieces", "2 social accounts", "250 contacts", "1 automation", "Community support"], cta: "Start Free", highlight: false },
              { plan: "Starter", price: "$39", period: "/month", credits: "200", features: ["200 content pieces", "5 social accounts", "2,500 contacts", "5 automations", "Email support"], cta: "Get Started", highlight: false },
              { plan: "Growth", price: "$99", period: "/month", credits: "1,000", features: ["Unlimited content", "15 social accounts", "25,000 contacts", "25 automations", "All integrations", "Priority support"], cta: "Start Growth", highlight: true },
              { plan: "Business", price: "$249", period: "/month", credits: "5,000", features: ["Everything in Growth", "50 social accounts", "100,000 contacts", "Unlimited automations", "SSO + SAML", "Dedicated CSM"], cta: "Start Business", highlight: false },
            ].map((p) => (
              <div key={p.plan} className={`border bg-card p-6 space-y-5 ${p.highlight ? "border-accent" : "border-border"}`}>
                {p.highlight && <span className="text-[10px] font-mono uppercase tracking-widest bg-accent text-accent-foreground px-2 py-0.5">Most Popular</span>}
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{p.plan}</p>
                  <p className="font-display text-3xl font-medium tracking-tight mt-1">{p.price}<span className="text-base font-normal text-muted-foreground">{p.period}</span></p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{p.credits} AI credits/mo</p>
                </div>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-accent shrink-0" strokeWidth={2} />{f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-150 ${p.highlight
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "border border-foreground text-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Enterprise */}
          <div className="mt-6 border border-border bg-card p-6 flex items-center justify-between">
            <div>
              <p className="font-medium">Enterprise — from $699/month</p>
              <p className="text-sm text-muted-foreground mt-0.5">Custom AI fine-tuning · Dedicated infrastructure · Custom SLA · On-premise option</p>
            </div>
            <a href="mailto:sales@zenia.ai" className="border border-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-all duration-150 whitespace-nowrap">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="mb-12">
          <div className="h-px w-12 bg-accent mb-6" />
          <h2 className="font-display text-4xl font-medium tracking-tight">Frequently asked</h2>
        </div>
        <div className="max-w-2xl space-y-0 divide-y divide-border border-y border-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium list-none gap-4">
                {item.q}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 shrink-0" strokeWidth={1.5} />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 py-24 text-center">
          <div className="inline-flex mb-6">
            <div className="h-px w-12 bg-accent" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-medium tracking-tight mb-6">
            Start your free plan today
          </h2>
          <p className="text-muted-foreground mb-10 font-mono text-sm">No credit card · Cancel anytime · Setup in 2 minutes</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-10 py-4 text-sm font-semibold uppercase tracking-wider hover:bg-accent/90 transition-colors"
          >
            Get Started for Free <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 bg-accent" />
                <span className="font-display text-sm font-medium tracking-tight">Zenia</span>
              </Link>
              <p className="text-xs text-muted-foreground">The AI Marketing Operating System</p>
            </div>
            {[
              { label: "Product", links: [["Features", "#features"], ["Pricing", "#pricing"], ["Blog", "/blog"]] },
              { label: "Company", links: [["About", "/about"], ["Careers", "#"]] },
              { label: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"]] },
            ].map((col) => (
              <div key={col.label}>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">{col.label}</p>
                <ul className="space-y-2">
                  {col.links.map(([label, href]) => (
                    <li key={label}><Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-6 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <p>© 2025 Zenia. All rights reserved.</p>
            <p>Built for marketing teams worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
