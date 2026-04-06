import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const scheduleSchema = z.object({
  postId: z.string().min(1, "Post ID required"),
  scheduledAt: z.string().datetime("Invalid datetime"),
})

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const body = await req.json()
    const parsed = scheduleSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const { postId, scheduledAt } = parsed.data

    // Ensure post belongs to this workspace
    const post = await prisma.socialPost.findFirst({
      where: { id: postId, workspaceId: workspace.id },
    })
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 })

    const scheduledDate = new Date(scheduledAt)
    if (scheduledDate <= new Date()) {
      return Response.json({ error: "Scheduled time must be in the future" }, { status: 400 })
    }

    // Schedule via QStash if configured, otherwise just save the time
    let qstashMessageId: string | undefined
    if (process.env.QSTASH_TOKEN) {
      const { Client } = await import("@upstash/qstash")
      const qstash = new Client({ token: process.env.QSTASH_TOKEN })

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      const message = await qstash.publishJSON({
        url: `${appUrl}/api/webhooks/qstash`,
        notBefore: Math.floor(scheduledDate.getTime() / 1000),
        body: { postId, workspaceId: workspace.id },
      })
      qstashMessageId = message.messageId
    }

    const updated = await prisma.socialPost.update({
      where: { id: postId },
      data: {
        scheduledAt: scheduledDate,
        status: "SCHEDULED",
        ...(qstashMessageId ? { qstashMessageId } : {}),
      },
    })

    return Response.json(updated)
  } catch (err) {
    console.error("[POST /api/social/schedule]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
