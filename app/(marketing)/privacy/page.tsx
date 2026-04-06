import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy — Zenia",
  description: "How Zenia collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground font-mono">Last Updated: April 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">1. Introduction</h2>
            <p>
              Zenia (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is an AI marketing operating system designed to help users automate and optimize marketing workflows. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">2. Information We Collect</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">2.1 Personal Information</h3>
                <ul className="space-y-1 pl-4 border-l border-border">
                  {["Name", "Email address", "Account credentials", "Payment information (if applicable)"].map((item) => (
                    <li key={item} className="pl-3">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">2.2 Usage Data</h3>
                <ul className="space-y-1 pl-4 border-l border-border">
                  {["IP address", "Browser type", "Device information", "Pages visited", "Actions within the platform"].map((item) => (
                    <li key={item} className="pl-3">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">2.3 User Content</h3>
                <ul className="space-y-1 pl-4 border-l border-border">
                  {["Marketing data", "Uploaded files", "Generated AI content"].map((item) => (
                    <li key={item} className="pl-3">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="space-y-1 pl-4 border-l border-border">
              {[
                "Provide and maintain our services",
                "Improve user experience",
                "Personalize AI outputs",
                "Process transactions",
                "Communicate updates and support",
                "Ensure security and prevent fraud",
              ].map((item) => (
                <li key={item} className="pl-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal data. We may share data with:</p>
            <ul className="space-y-1 pl-4 border-l border-border">
              {[
                "Service providers (hosting, analytics, payments)",
                "Legal authorities when required",
                "Business transfers (mergers, acquisitions)",
              ].map((item) => (
                <li key={item} className="pl-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption, access control, and regular audits. However, no system is completely secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">6. Data Retention</h2>
            <p>
              We retain your data only as long as necessary for service delivery and legal compliance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="space-y-1 pl-4 border-l border-border">
              {[
                "Access your data",
                "Correct inaccurate data",
                "Request deletion",
                "Withdraw consent",
              ].map((item) => (
                <li key={item} className="pl-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">8. Third-Party Services</h2>
            <p>
              Zenia may integrate with third-party platforms. We are not responsible for their privacy practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">9. Children&apos;s Privacy</h2>
            <p>Zenia is not intended for users under 13.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Continued use of the service constitutes acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground font-mono uppercase tracking-wider">11. Contact Us</h2>
            <p>
              For questions, contact:{" "}
              <a href="mailto:support@zenia.ai" className="text-accent hover:underline">
                support@zenia.ai
              </a>
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>© 2026 Zenia. All rights reserved.</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}
