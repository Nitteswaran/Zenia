export const PLATFORM_CONFIG = {
  LINKEDIN: {
    name: "LinkedIn",
    color: "#0077B5",
    maxChars: 3000,
    maxImages: 9,
    supportsVideo: true,
    supportsFirstComment: true,
    aspectRatio: "1.91:1",
  },
  INSTAGRAM: {
    name: "Instagram",
    color: "#E4405F",
    maxChars: 2200,
    maxImages: 10,
    supportsVideo: true,
    supportsFirstComment: true,
    aspectRatio: "1:1",
  },
  FACEBOOK: {
    name: "Facebook",
    color: "#1877F2",
    maxChars: 63206,
    maxImages: 10,
    supportsVideo: true,
    supportsFirstComment: false,
    aspectRatio: "1.91:1",
  },
  TWITTER: {
    name: "Twitter / X",
    color: "#000000",
    maxChars: 280,
    maxImages: 4,
    supportsVideo: true,
    supportsFirstComment: false,
    aspectRatio: "16:9",
  },
  TIKTOK: {
    name: "TikTok",
    color: "#69C9D0",
    maxChars: 2200,
    maxImages: 0,
    supportsVideo: true,
    supportsFirstComment: false,
    aspectRatio: "9:16",
  },
  YOUTUBE: {
    name: "YouTube",
    color: "#FF0000",
    maxChars: 5000,
    maxImages: 0,
    supportsVideo: true,
    supportsFirstComment: false,
    aspectRatio: "16:9",
  },
} as const

export type SocialPlatformKey = keyof typeof PLATFORM_CONFIG

export function getPlatformConfig(platform: string) {
  return PLATFORM_CONFIG[platform as SocialPlatformKey] ?? null
}

export function getCharacterLimit(platform: string): number {
  return PLATFORM_CONFIG[platform as SocialPlatformKey]?.maxChars ?? 280
}

export function exceedsCharacterLimit(text: string, platform: string): boolean {
  return text.length >= getCharacterLimit(platform)
}
