import type { PublishParams } from "./publisher"

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3"

export async function publishYouTubePost(params: PublishParams): Promise<string> {
  // YouTube requires video upload — community posts use a different endpoint.
  // This handles community post (text + optional image) for channel pages.
  const res = await fetch(`${YOUTUBE_API}/communityPosts?part=snippet`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      snippet: {
        type: params.mediaUrls.length > 0 ? "IMAGE" : "TEXT",
        textOriginal: params.caption,
        ...(params.mediaUrls.length > 0
          ? {
              imageUrl: params.mediaUrls[0],
            }
          : {}),
      },
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`YouTube API error ${res.status}: ${error}`)
  }

  const data = (await res.json()) as { id: string }
  return data.id
}
