import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { publishToSocialPlatform } from "@/lib/social/publisher"

export const runtime = "nodejs"

const publishSchema = z.object({
  postId: z.string().min(1, "Post ID required"),
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
    const parsed = publishSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const post = await prisma.socialPost.findFirst({
      where: { id: parsed.data.postId, workspaceId: workspace.id },
      include: { socialAccount: true },
    })
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 })
    if (!post.socialAccount) return Response.json({ error: "No social account linked to this post" }, { status: 400 })

    // Mark as publishing
    await prisma.socialPost.update({ where: { id: post.id }, data: { status: "PUBLISHING" } })

    try {
      const platformPostId = await publishToSocialPlatform({
        platform: post.platform,
        caption: post.caption,
        mediaUrls: post.mediaUrls,
        accessToken: post.socialAccount.accessToken,
        accountId: post.socialAccount.accountId,
      })

      const updated = await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          platformPostId,
        },
      })

      return Response.json(updated)
    } catch (publishErr) {
      await prisma.socialPost.update({ where: { id: post.id }, data: { status: "FAILED" } })
      console.error("[Publish Error]", publishErr)
      return Response.json({ error: "Failed to publish post to platform" }, { status: 502 })
    }
  } catch (err) {
    console.error("[POST /api/social/publish]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
