import type { PublishParams } from "./publisher"

const GRAPH_API = "https://graph.facebook.com/v18.0"

export async function publishFacebookPost(params: PublishParams): Promise<string> {
  const endpoint =
    params.mediaUrls.length > 0
      ? `${GRAPH_API}/${params.accountId}/photos`
      : `${GRAPH_API}/${params.accountId}/feed`

  const body: Record<string, unknown> = {
    access_token: params.accessToken,
    message: params.caption,
  }

  if (params.mediaUrls.length > 0) {
    body.url = params.mediaUrls[0]
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Facebook API error ${res.status}: ${error}`)
  }

  const data = (await res.json()) as { id: string; post_id?: string }
  return data.post_id ?? data.id
}
