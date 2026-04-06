import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ── Route classification ──────────────────────────────────────────────────────

const PUBLIC_PATHS = new Set(["/", "/pricing", "/about", "/blog", "/contact", "/terms", "/privacy"])

const PUBLIC_PREFIXES = [
  "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email",
  // Public API: webhooks (signed), health check, public v1 API (API-key auth)
  "/api/webhooks/", "/api/health", "/api/v1/",
  // Next.js internals
  "/_next/", "/favicon",
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

// ── IP-based abuse shield (not plan-aware — for DDoS protection) ─────────────

let ipRatelimiter: Ratelimit | null = null

function getIpRatelimiter(): Ratelimit | null {
  if (ipRatelimiter) return ipRatelimiter
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null

  ipRatelimiter = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    // 300 requests/minute per IP for general API routes
    limiter: Ratelimit.slidingWindow(300, "1 m"),
    analytics: false,
    prefix: "zenia:ip",
  })
  return ipRatelimiter
}

// Stricter limit for auth endpoints (30 req/min per IP — brute-force protection)
let authRatelimiter: Ratelimit | null = null

function getAuthRatelimiter(): Ratelimit | null {
  if (authRatelimiter) return authRatelimiter
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null

  authRatelimiter = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: false,
    prefix: "zenia:auth",
  })
  return authRatelimiter
}

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // Generate a unique request ID for tracing
  const requestId = crypto.randomUUID()

  // ── IP-based rate limiting on API routes ────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1"

    const isAuthRoute = pathname.startsWith("/api/auth/")
    const limiter = isAuthRoute ? getAuthRatelimiter() : getIpRatelimiter()

    if (limiter) {
      const { success, limit, remaining, reset } = await limiter.limit(ip)
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests", requestId }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-Request-Id": requestId,
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": String(remaining),
              "X-RateLimit-Reset": String(reset),
              "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            },
          }
        )
      }
    }
  }

  // ── Authentication check for protected routes ───────────────────────────────
  const { supabase, response } = createSupabaseMiddlewareClient(request)
  const { data: { session } } = await supabase.auth.getSession()

  // Propagate request ID through to the response
  response.headers.set("X-Request-Id", requestId)

  if (!session && !isPublicRoute(pathname)) {
    // All non-public, non-API routes require auth — redirect to login
    if (!pathname.startsWith("/api/")) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    // API routes return 401 (handled in route handlers)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
}
