"use client"

import Link from "next/link"
import { ArrowRight, Shield, RotateCcw, Lock } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Noise grain texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015]" aria-hidden>
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Label */}
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">
          AI Marketing Operating System
        </p>

        {/* Hero headline */}
        <h1 className="text-[clamp(3rem,8vw,8rem)] font-display font-black leading-[0.9] tracking-[-0.04em] mb-8">
          The AI That
          <br />
          <span className="text-accent">Runs</span> Your
          <br />
          Marketing.
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
          One platform to generate content, manage campaigns, schedule social posts, nurture leads,
          and automate your entire marketing — powered by AI agents that actually execute.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-6">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-accent text-foreground px-8 py-4 text-sm font-mono uppercase tracking-[0.15em] hover:bg-accent/90 transition-colors"
          >
            Start for Free
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <Link
            href="#features"
            className="text-sm font-mono uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground hover:border-foreground pb-0.5"
          >
            See Features
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-6 mt-10">
          {[
            { icon: Shield, text: "No credit card required" },
            { icon: RotateCcw, text: "Cancel anytime" },
            { icon: Lock, text: "SOC 2 ready" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
