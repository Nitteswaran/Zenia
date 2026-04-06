"use client"

import { cn } from "@/lib/utils"

interface PlatformPreviewProps {
  platform: string
  caption: string
  accountName?: string
  mediaUrl?: string
  className?: string
}

export function PlatformPreview({ platform, caption, accountName = "Your Account", mediaUrl, className }: PlatformPreviewProps) {
  const truncated = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + "…" : text

  switch (platform) {
    case "TWITTER":
      return (
        <div className={cn("border border-border bg-[#000] text-white p-4 max-w-sm", className)}>
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 bg-[#333] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{accountName}</p>
              <p className="text-[13px] text-[#71767b] mb-2">@{accountName.toLowerCase().replace(/\s+/g, "")}</p>
              <p className="text-[14px] leading-5 whitespace-pre-wrap">{truncated(caption, 280)}</p>
              {mediaUrl && <img src={mediaUrl} alt="Media" className="mt-3 w-full object-cover max-h-48" />}
              <p className="text-[12px] text-[#71767b] mt-2">
                {new Date().toLocaleTimeString()} · {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )

    case "LINKEDIN":
      return (
        <div className={cn("border border-[#e0e0e0] bg-white text-[#000000e6] p-4 max-w-sm", className)}>
          <div className="flex items-start gap-3 mb-3">
            <div className="h-10 w-10 bg-[#ddd] shrink-0" />
            <div>
              <p className="text-sm font-semibold">{accountName}</p>
              <p className="text-xs text-[#666]">Marketing Professional · 1st</p>
              <p className="text-xs text-[#666]">Just now · 🌐</p>
            </div>
          </div>
          <p className="text-[13px] leading-5 whitespace-pre-wrap">{truncated(caption, 3000)}</p>
          {mediaUrl && <img src={mediaUrl} alt="Media" className="mt-3 w-full object-cover" />}
        </div>
      )

    case "INSTAGRAM":
      return (
        <div className={cn("border border-[#dbdbdb] bg-white text-black max-w-sm", className)}>
          <div className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
              <div className="h-full w-full rounded-full bg-white" />
            </div>
            <p className="text-[13px] font-semibold">{accountName}</p>
          </div>
          {mediaUrl ? (
            <img src={mediaUrl} alt="Post" className="w-full aspect-square object-cover" />
          ) : (
            <div className="w-full aspect-square bg-[#fafafa] flex items-center justify-center text-xs text-[#aaa]">
              No image
            </div>
          )}
          <div className="p-3">
            <p className="text-[13px] whitespace-pre-wrap">
              <span className="font-semibold">{accountName}</span> {truncated(caption, 2200)}
            </p>
          </div>
        </div>
      )

    default:
      return (
        <div className={cn("border border-border bg-card p-4 max-w-sm", className)}>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">{platform} Preview</p>
          <p className="text-sm whitespace-pre-wrap">{caption}</p>
          {mediaUrl && <img src={mediaUrl} alt="Media" className="mt-3 w-full object-cover max-h-48" />}
        </div>
      )
  }
}
