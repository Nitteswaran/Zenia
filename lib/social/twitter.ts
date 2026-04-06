import type { PublishParams } from "./publisher"

const TWITTER_API = "https://api.twitter.com/2"

export async function publishTwitterPost(params: PublishParams): Promise<string> {
  const body: Record<string, unknown> = { text: params.caption }

  // Media upload would require a separate upload step with v1.1 API
  // For now we attach the first media URL if available via the media object
  if (params.mediaUrls.length > 0) {
    // Note: Full Twitter media upload requires chunked upload API.
    // This handles pre-uploaded media IDs passed as URLs.
    body.media = { media_ids: params.mediaUrls }
  }

  const res = await fetch(`${TWITTER_API}/tweets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Twitter API error ${res.status}: ${error}`)
  }

  const data = (await res.json()) as { data: { id: string } }
  return data.data.id
}
