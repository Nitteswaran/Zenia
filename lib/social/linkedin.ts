import type { PublishParams } from "./publisher"

const LINKEDIN_API = "https://api.linkedin.com/v2"

export async function publishLinkedInPost(params: PublishParams): Promise<string> {
  const body: Record<string, unknown> = {
    author: `urn:li:person:${params.accountId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: params.caption },
        shareMediaCategory: params.mediaUrls.length > 0 ? "IMAGE" : "NONE",
        ...(params.mediaUrls.length > 0
          ? {
              media: params.mediaUrls.map((url) => ({
                status: "READY",
                originalUrl: url,
              })),
            }
          : {}),
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  }

  const res = await fetch(`${LINKEDIN_API}/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`LinkedIn API error ${res.status}: ${error}`)
  }

  const data = (await res.json()) as { id: string }
  return data.id
}
