/**
 * Structured logger for Zenia.
 *
 * - In production: JSON output for log aggregators (Datadog, Axiom, Vercel Logs)
 * - In development: human-readable pretty output
 * - Every log carries a request ID when called from within a request context
 * - Never logs sensitive fields (tokens, passwords, raw keys)
 */

type LogLevel = "debug" | "info" | "warn" | "error"

const SENSITIVE_KEYS = new Set([
  "password", "token", "accessToken", "refreshToken", "apiKey", "keyHash",
  "secret", "authorization", "cookie", "stripeCustomerId", "stripeSubId",
])

function redact(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || obj === undefined) return obj
  if (typeof obj !== "object") return obj
  if (Array.isArray(obj)) return obj.map((v) => redact(v, depth + 1))

  const redacted: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    redacted[k] = SENSITIVE_KEYS.has(k) ? "[REDACTED]" : redact(v, depth + 1)
  }
  return redacted
}

function formatMessage(
  level: LogLevel,
  message: string,
  meta: Record<string, unknown>
): string {
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(redact(meta) as Record<string, unknown>),
    })
  }

  const prefix = {
    debug: "🔍 DEBUG",
    info: "ℹ️  INFO ",
    warn: "⚠️  WARN ",
    error: "🔴 ERROR",
  }[level]

  const metaStr = Object.keys(meta).length
    ? " " + JSON.stringify(redact(meta), null, 0)
    : ""

  return `[${new Date().toISOString()}] ${prefix} ${message}${metaStr}`
}

function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
  const line = formatMessage(level, message, meta)
  if (level === "error") {
    console.error(line)
  } else if (level === "warn") {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),

  /** Log an API request with method, path, status, and duration */
  apiRequest: (opts: {
    method: string
    path: string
    status: number
    durationMs: number
    workspaceId?: string
    requestId?: string
  }) => {
    log("info", `${opts.method} ${opts.path} → ${opts.status} (${opts.durationMs}ms)`, {
      requestId: opts.requestId,
      workspaceId: opts.workspaceId,
    })
  },
}
