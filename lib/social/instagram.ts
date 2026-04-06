import type { PublishParams } from "./publisher"

const GRAPH_API = "https://graph.facebook.com/v18.0"

export async function publishInstagramPost(params: PublishParams): Promise<string> {
  // Instagram Graph API: first create a media container, then publish it
  const mediaUrl = params.mediaUrls[0]

  if (!mediaUrl) {
    // Text-only not supported on Instagram — use a placeholder approach
    throw new Error("Instagram requires at least one image or video")
  }

  // Step 1: Create media container
  const containerRes = await fetch(
    `${GRAPH_API}/${params.accountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: mediaUrl,
        caption: params.caption,
        access_token: params.accessToken,
      }),
    }
  )

  if (!containerRes.ok) {
    const error = await containerRes.text()
    throw new Error(`Instagram container creation error ${containerRes.status}: ${error}`)
  }

  const container = (await containerRes.json()) as { id: string }

  // Step 2: Publish the container
  const publishRes = await fetch(
    `${GRAPH_API}/${params.accountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: params.accessToken,
      }),
    }
  )

  if (!publishRes.ok) {
    const error = await publishRes.text()
    throw new Error(`Instagram publish error ${publishRes.status}: ${error}`)
  }

  const result = (await publishRes.json()) as { id: string }
  return result.id
}
