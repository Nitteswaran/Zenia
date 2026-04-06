import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service — Zenia",
  description: "The terms and conditions governing your use of the Zenia platform.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 max-w-[1200px] mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 bg-accent" />
          <span className="font-display text-lg font-medium tracking-tight">Zenia</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          Back to home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground font-mono">Last Updated: April 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">1. Acceptance of Terms</h2>
            <p>By accessing or using Zenia, you agree to be bound by these Terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">2. Description of Service</h2>
            <p>
              Zenia provides AI-powered tools for marketing automation, content generation, and analytics.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">3. User Accounts</h2>
            <ul className="space-y-1 pl-4 border-l border-border">
              {[
                "You must provide accurate information",
                "You are responsible for account security",
                "You must notify us of unauthorized use",
              ].map((item) => (
                <li key={item} className="pl-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">4. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul className="space-y-1 pl-4 border-l border-border">
              {[
                "Use the platform for illegal activities",
                "Generate harmful or misleading content",
                "Violate intellectual property rights",
                "Attempt to hack or disrupt the system",
              ].map((item) => (
                <li key={item} className="pl-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">5. AI-Generated Content</h2>
            <ul className="space-y-1 pl-4 border-l border-border">
              {[
                "Outputs are generated automatically and may not be accurate",
                "You are responsible for reviewing and using content",
              ].map((item) => (
                <li key={item} className="pl-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">6. Payments and Subscriptions</h2>
            <ul className="space-y-1 pl-4 border-l border-border">
              {[
                "Fees are billed as agreed",
                "No refunds unless required by law",
                "We may change pricing with notice",
              ].map((item) => (
                <li key={item} className="pl-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">7. Intellectual Property</h2>
            <ul className="space-y-1 pl-4 border-l border-border">
              {[
                "Zenia retains ownership of the platform",
                "Users retain ownership of their content",
                "You grant us a license to process your data",
              ].map((item) => (
                <li key={item} className="pl-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">8. Termination</h2>
            <p>We may suspend or terminate accounts that violate these terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">9. Disclaimer of Warranties</h2>
            <p>The service is provided &ldquo;as is&rdquo; without warranties of any kind.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">10. Limitation of Liability</h2>
            <p>We are not liable for indirect, incidental, or consequential damages.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">11. Governing Law</h2>
            <p>These Terms are governed by applicable laws in your jurisdiction.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">12. Changes to Terms</h2>
            <p>We may update these Terms. Continued use means acceptance.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">13. Contact</h2>
            <p>
              <a href="mailto:spnittes@gmail.com" className="text-accent hover:underline">
                spnittes@gmail.com
              </a>
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>© 2026 Zenia. All rights reserved.</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            ← Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
