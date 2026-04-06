import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
// No caching — health checks must always be fresh
export const dynamic = "force-dynamic"

export async function GET() {
  const start = Date.now()
  const checks: Record<string, { status: "ok" | "error"; latencyMs?: number; message?: string }> = {}

  // ── Database ──────────────────────────────────────────────────────────────
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: "ok", latencyMs: Date.now() - dbStart }
  } catch (err) {
    checks.database = { status: "error", message: "Database unreachable" }
    console.error("[Health] DB check failed:", err)
  }

  // ── Redis (optional) ──────────────────────────────────────────────────────
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redisStart = Date.now()
      const res = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
        {
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
          signal: AbortSignal.timeout(3000),
        }
      )
      checks.redis = res.ok
        ? { status: "ok", latencyMs: Date.now() - redisStart }
        : { status: "error", message: `Redis returned ${res.status}` }
    } catch {
      checks.redis = { status: "error", message: "Redis unreachable" }
    }
  }

  // ── Anthropic API (optional) ─────────────────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    checks.anthropic = { status: "ok" } // key is present; avoid making API call on every health check
  }

  if (process.env.OPENAI_API_KEY) {
    checks.openai = { status: "ok" }
  }

  const allOk = Object.values(checks).every((c) => c.status === "ok")
  const httpStatus = allOk ? 200 : 503

  return Response.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
      environment: process.env.NODE_ENV,
      uptimeMs: process.uptime() * 1000,
      responseTimeMs: Date.now() - start,
      checks,
    },
    { status: httpStatus }
  )
}
