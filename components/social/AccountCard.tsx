"use client"

import { useState } from "react"
import { Unlink, ExternalLink } from "lucide-react"
import { PLATFORM_CONFIG } from "@/lib/social/platforms"
import { cn } from "@/lib/utils"
import type { SocialAccount } from "@prisma/client"

interface AccountCardProps {
  account: SocialAccount
  onDisconnect?: (id: string) => void
}

const PLATFORM_ICONS: Record<string, string> = {
  LINKEDIN: "in",
  INSTAGRAM: "ig",
  FACEBOOK: "fb",
  TWITTER: "𝕏",
  TIKTOK: "tt",
  YOUTUBE: "yt",
}

export function AccountCard({ account, onDisconnect }: AccountCardProps) {
  const [confirming, setConfirming] = useState(false)
  const config = PLATFORM_CONFIG[account.platform as keyof typeof PLATFORM_CONFIG]

  return (
    <div className="border border-border p-4 flex items-center gap-4">
      {/* Platform icon */}
      <div
        className="h-10 w-10 flex items-center justify-center text-sm font-mono font-bold shrink-0"
        style={{ backgroundColor: config?.color ?? "#333", color: "#fff" }}
      >
        {PLATFORM_ICONS[account.platform] ?? "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{account.accountName}</p>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          {config?.name ?? account.platform}
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "h-1.5 w-1.5 rounded-full",
          account.isActive ? "bg-green-500" : "bg-muted-foreground"
        )} />
        <span className="text-xs text-muted-foreground font-mono">
          {account.isActive ? "Connected" : "Inactive"}
        </span>
      </div>

      {/* External link */}
      {account.accountUrl && (
        <a
          href={account.accountUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="View profile"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
        </a>
      )}

      {/* Disconnect */}
      {onDisconnect && (
        confirming ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDisconnect(account.id)}
              className="text-xs text-accent font-mono uppercase tracking-wider hover:underline"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-muted-foreground font-mono uppercase tracking-wider hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-muted-foreground hover:text-accent transition-colors"
            aria-label="Disconnect account"
          >
            <Unlink className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )
      )}
    </div>
  )
}
