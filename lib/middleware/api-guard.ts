/**
 * withApiGuard — Higher-order function for API route handlers.
 *
 * Wraps a handler with:
 *  1. Authentication (Supabase)
 *  2. Workspace resolution (Prisma)
 *  3. Plan-aware API rate limiting (Upstash Redis)
 *  4. Structured error handling + timing
 *
 * Usage:
 *   export const GET = withApiGuard(async (req, { workspace }) => {
 *     const items = await prisma.campaign.findMany({ where: { workspaceId: workspace.id } })
 *     return Response.json(items)
 *   })
 */

import type { NextRequest } from "next/server"
import type { Workspace } from "@prisma/client"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { checkAPIRateLimit, rateLimitHeaders } from "@/lib/ai/rate-limit"
import { logger } from "@/lib/logger"
import type { PlanKey } from "@/lib/plan-limits"

export interface GuardedContext {
  workspace: Workspace
  userId: string
  requestId: string
}

type GuardedHandler<P = Record<string, never>> = (
  req: NextRequest,
  ctx: GuardedContext,
  params?: P
) => Promise<Response>

export function withApiGuard<P = Record<string, never>>(
  handler: GuardedHandler<P>,
  opts: { skipRateLimit?: boolean } = {}
) {
  return async (req: NextRequest, params?: P): Promise<Response> => {
    const start = Date.now()
    const requestId = crypto.randomUUID()

    try {
      // ── Auth ────────────────────────────────────────────────────────────────
      const authUser = await getAuthUser()
      if (!authUser?.email) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
      }

      // ── Workspace ───────────────────────────────────────────────────────────
      const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email },
        include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
      })
      const workspace = dbUser?.workspaceMembers[0]?.workspace
      if (!workspace) {
        return Response.json({ error: "Workspace not found" }, { status: 404 })
      }

      // ── Rate limit ──────────────────────────────────────────────────────────
      if (!opts.skipRateLimit) {
        const rl = await checkAPIRateLimit(workspace.id, workspace.plan as PlanKey)
        if (!rl.allowed) {
          logger.warn("API rate limit exceeded", { workspaceId: workspace.id, requestId })
          return new Response(
            JSON.stringify({ error: "Too many requests. Please slow down or upgrade your plan." }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": rl.reset
                  ? String(Math.ceil((rl.reset - Date.now()) / 1000))
                  : "60",
                "X-Request-Id": requestId,
                ...rateLimitHeaders(rl),
              },
            }
          )
        }
      }

      // ── Handler ─────────────────────────────────────────────────────────────
      const response = await handler(req, { workspace, userId: dbUser!.id, requestId }, params)

      // Add request ID and timing to all successful responses
      response.headers.set("X-Request-Id", requestId)
      response.headers.set("X-Response-Time", `${Date.now() - start}ms`)

      logger.apiRequest({
        method: req.method,
        path: new URL(req.url).pathname,
        status: response.status,
        durationMs: Date.now() - start,
        workspaceId: workspace.id,
        requestId,
      })

      return response
    } catch (err) {
      logger.error("Unhandled API error", {
        requestId,
        path: new URL(req.url).pathname,
        method: req.method,
        error: err instanceof Error ? err.message : String(err),
      })
      return Response.json(
        { error: "Internal server error", requestId },
        { status: 500, headers: { "X-Request-Id": requestId } }
      )
    }
  }
}
