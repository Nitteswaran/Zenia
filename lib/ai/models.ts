/**
 * AI Model Routing
 *
 * Three tiers mapped to use-cases:
 *   AGENT    → Claude Sonnet  — agent reasoning, workflow execution, multilingual
 *   PREMIUM  → GPT-4o Mini    — strategic marketing assets, long-form, high-quality
 *   EFFICIENT→ GPT-4o Mini    — short-form content, analytics summaries, structured tasks
 */

export type ModelTier = "AGENT" | "PREMIUM" | "EFFICIENT"
export type ModelProvider = "anthropic" | "openai"

export interface ModelConfig {
  tier: ModelTier
  provider: ModelProvider
  model: string
  maxTokens: number
  /** Credit cost multiplier relative to base 1 credit */
  creditCost: number
  label: string
}

export const MODEL_CONFIGS: Record<ModelTier, ModelConfig> = {
  AGENT: {
    tier: "AGENT",
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    maxTokens: 4096,
    creditCost: 1,
    label: "Claude Sonnet",
  },
  PREMIUM: {
    tier: "PREMIUM",
    provider: "openai",
    model: "gpt-4o-mini",
    maxTokens: 4096,
    creditCost: 3,
    label: "GPT-4o Mini",
  },
  EFFICIENT: {
    tier: "EFFICIENT",
    provider: "openai",
    model: "gpt-4o-mini",
    maxTokens: 2048,
    creditCost: 1,
    label: "GPT-4o Mini",
  },
}

/**
 * Content types that warrant GPT-4-turbo (strategic, long-form, high-value assets)
 */
const PREMIUM_CONTENT_TYPES = new Set([
  "BLOG_POST",
  "PRESS_RELEASE",
  "NEWSLETTER",
  "VIDEO_SCRIPT",
])

/**
 * Content types best handled by the efficient tier (short-form, structured)
 */
const EFFICIENT_CONTENT_TYPES = new Set([
  "SOCIAL_MEDIA",
  "AD_COPY",
])

/**
 * Route a content generation request to the appropriate model tier.
 *
 * Rules (in priority order):
 *  1. Non-English language → always Claude (multilingual strength)
 *  2. Strategic/long-form content types → GPT-4-turbo (PREMIUM)
 *  3. Short-form / structured tasks → GPT-3.5-turbo (EFFICIENT)
 *  4. Default fallback → Claude Sonnet (AGENT)
 */
export function resolveContentModel(opts: {
  contentType: string
  language?: string
}): ModelConfig {
  const { contentType, language = "en" } = opts

  // Rule 1: Non-English → Claude for multilingual accuracy
  if (language !== "en") {
    return MODEL_CONFIGS.AGENT
  }

  // Rule 2: Strategic / long-form → GPT-4o Mini (fallback to Claude if no key)
  if (PREMIUM_CONTENT_TYPES.has(contentType)) {
    return process.env.OPENAI_API_KEY ? MODEL_CONFIGS.PREMIUM : MODEL_CONFIGS.AGENT
  }

  // Rule 3: Short-form → GPT-4o Mini (fallback to Claude if no key)
  if (EFFICIENT_CONTENT_TYPES.has(contentType)) {
    return process.env.OPENAI_API_KEY ? MODEL_CONFIGS.EFFICIENT : MODEL_CONFIGS.AGENT
  }

  // Rule 4: Default → Claude Sonnet
  return MODEL_CONFIGS.AGENT
}

/** Agent chat always uses Claude Sonnet */
export const AGENT_MODEL = MODEL_CONFIGS.AGENT
