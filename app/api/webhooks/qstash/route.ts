import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { publishToSocialPlatform } from "@/lib/social/publisher"

export const runtime = "nodejs"

/**
 * QStash webhook — executes scheduled social posts.
 * QStash signs all requests with QSTASH_CURRENT_SIGNING_KEY / NEXT_SIGNING_KEY.
 */
export async function POST(req: NextRequest) {
  // Verify QStash signature when the signing key is configured
  if (process.env.QSTASH_CURRENT_SIGNING_KEY) {
    try {
      const { Receiver } = await import("@upstash/qstash")
      const receiver = new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? "",
      })
      const body = await req.text()
      const signature = req.headers.get("upstash-signature") ?? ""
      const isValid = await receiver.verify({ signature, body })
      if (!isValid) {
        return Response.json({ error: "Invalid QStash signature" }, { status: 401 })
      }
      const payload = JSON.parse(body) as { postId?: string; workspaceId?: string }
      return handlePayload(payload)
    } catch (err) {
      console.error("[QStash] Signature verification error:", err)
      return Response.json({ error: "Signature verification failed" }, { status: 401 })
    }
  }

  // Dev/staging: skip signature check
  const payload = (await req.json()) as { postId?: string; workspaceId?: string }
  return handlePayload(payload)
}

async function handlePayload(payload: { postId?: string; workspaceId?: string }) {
  const { postId, workspaceId } = payload

  if (!postId || !workspaceId) {
    return Response.json({ error: "Missing postId or workspaceId" }, { status: 400 })
  }

  const post = await prisma.socialPost.findFirst({
    where: { id: postId, workspaceId },
    include: { socialAccount: true },
  })

  if (!post) return Response.json({ error: "Post not found" }, { status: 404 })
  if (post.status !== "SCHEDULED") {
    // Already published or cancelled — skip
    return Response.json({ skipped: true })
  }
  if (!post.socialAccount) {
    await prisma.socialPost.update({ where: { id: postId }, data: { status: "FAILED" } })
    return Response.json({ error: "No linked social account" }, { status: 400 })
  }

  await prisma.socialPost.update({ where: { id: postId }, data: { status: "PUBLISHING" } })

  try {
    const platformPostId = await publishToSocialPlatform({
      platform: post.platform,
      caption: post.caption,
      mediaUrls: post.mediaUrls,
      accessToken: post.socialAccount.accessToken,
      accountId: post.socialAccount.accountId,
    })

    await prisma.socialPost.update({
      where: { id: postId },
      data: { status: "PUBLISHED", publishedAt: new Date(), platformPostId },
    })

    return Response.json({ published: true, platformPostId })
  } catch (err) {
    console.error("[QStash] Publish failed:", err)
    await prisma.socialPost.update({ where: { id: postId }, data: { status: "FAILED" } })
    return Response.json({ error: "Publish failed" }, { status: 502 })
  }
}
