import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import type { PlanKey } from "@/lib/plan-limits"

/**
 * AI rate limits (requests per minute) per plan tier.
 *
 * Enforced per workspace ID using a sliding window algorithm in Redis.
 * Protects against runaway usage and ensures fair API cost distribution.
 */
const AI_RATE_LIMITS: Record<PlanKey, number | null> = {
  FREE: 5,        // 5 AI requests/min — prevents abuse on free tier
  STARTER: 20,    // 20 AI requests/min
  GROWTH: 60,     // 60 AI requests/min
  BUSINESS: 120,  // 120 AI requests/min
  ENTERPRISE: null, // null = unlimited
}

/**
 * General API rate limits (requests per minute) per plan.
 * Applies to all /api/* routes, not just AI.
 */
const API_RATE_LIMITS: Record<PlanKey, number | null> = {
  FREE: 60,
  STARTER: 200,
  GROWTH: 500,
  BUSINESS: 1000,
  ENTERPRISE: null,
}

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

function buildRatelimiter(redis: Redis, requestsPerMinute: number): Ratelimit {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requestsPerMinute, "1 m"),
    analytics: true,
    prefix: "zenia:rl",
  })
}

export interface RateLimitResult {
  allowed: boolean
  limit: number | null
  remaining: number | null
  reset: number | null // unix ms
}

/**
 * Check AI rate limit for a workspace.
 * Returns allowed=true if Redis is not configured (fail-open in dev).
 */
export async function checkAIRateLimit(
  workspaceId: string,
  plan: PlanKey
): Promise<RateLimitResult> {
  const rpm = AI_RATE_LIMITS[plan]

  // Unlimited plan
  if (rpm === null) return { allowed: true, limit: null, remaining: null, reset: null }

  const redis = getRedis()
  // Fail-open when Redis not configured (local dev without Redis)
  if (!redis) return { allowed: true, limit: rpm, remaining: rpm, reset: null }

  const limiter = buildRatelimiter(redis, rpm)
  const key = `ai:${workspaceId}`
  const result = await limiter.limit(key)

  return {
    allowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

/**
 * Check general API rate limit for a workspace.
 */
export async function checkAPIRateLimit(
  workspaceId: string,
  plan: PlanKey
): Promise<RateLimitResult> {
  const rpm = API_RATE_LIMITS[plan]

  if (rpm === null) return { allowed: true, limit: null, remaining: null, reset: null }

  const redis = getRedis()
  if (!redis) return { allowed: true, limit: rpm, remaining: rpm, reset: null }

  const limiter = buildRatelimiter(redis, rpm)
  const key = `api:${workspaceId}`
  const result = await limiter.limit(key)

  return {
    allowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

/**
 * Build standard rate-limit response headers.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {}
  if (result.limit !== null) headers["X-RateLimit-Limit"] = String(result.limit)
  if (result.remaining !== null) headers["X-RateLimit-Remaining"] = String(result.remaining)
  if (result.reset !== null) headers["X-RateLimit-Reset"] = String(result.reset)
  return headers
}
