import type { SocialPlatform } from "@prisma/client"

export interface PublishParams {
  platform: SocialPlatform
  caption: string
  mediaUrls: string[]
  accessToken: string
  accountId: string
}

/**
 * Publishes a post to the specified social platform.
 * Returns the platform-specific post ID on success.
 * Each platform adapter is in lib/social/<platform>.ts
 */
export async function publishToSocialPlatform(params: PublishParams): Promise<string> {
  switch (params.platform) {
    case "LINKEDIN": {
      const { publishLinkedInPost } = await import("./linkedin")
      return publishLinkedInPost(params)
    }
    case "TWITTER": {
      const { publishTwitterPost } = await import("./twitter")
      return publishTwitterPost(params)
    }
    case "INSTAGRAM": {
      const { publishInstagramPost } = await import("./instagram")
      return publishInstagramPost(params)
    }
    case "FACEBOOK": {
      const { publishFacebookPost } = await import("./facebook")
      return publishFacebookPost(params)
    }
    case "TIKTOK": {
      const { publishTikTokPost } = await import("./tiktok")
      return publishTikTokPost(params)
    }
    case "YOUTUBE": {
      const { publishYouTubePost } = await import("./youtube")
      return publishYouTubePost(params)
    }
    default:
      throw new Error(`Unsupported platform: ${params.platform}`)
  }
}
