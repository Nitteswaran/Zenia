import type { PublishParams } from "./publisher"

const TIKTOK_API = "https://open.tiktokapis.com/v2"

export async function publishTikTokPost(params: PublishParams): Promise<string> {
  // TikTok Content Posting API requires video — we init a direct post
  const res = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: params.caption.slice(0, 150),
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: params.mediaUrls[0],
      },
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`TikTok API error ${res.status}: ${error}`)
  }

  const data = (await res.json()) as { data: { publish_id: string } }
  return data.data.publish_id
}
