import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const PLATFORM_CONFIGS: Record<string, {
  authUrl: string
  clientIdEnv: string
  scopes: string[]
}> = {
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    clientIdEnv: "TWITTER_CLIENT_ID",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    scopes: ["r_liteprofile", "r_emailaddress", "w_member_social"],
  },
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    clientIdEnv: "INSTAGRAM_APP_ID",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
  },
  facebook: {
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    clientIdEnv: "FACEBOOK_APP_ID",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
  },
  tiktok: {
    authUrl: "https://www.tiktok.com/v2/auth/authorize",
    clientIdEnv: "TIKTOK_CLIENT_KEY",
    scopes: ["user.info.basic", "video.publish"],
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    scopes: [
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.upload",
    ],
  },
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser) {
    return redirect("/login")
  }

  const { platform } = await params
  const config = PLATFORM_CONFIGS[platform.toLowerCase()]

  if (!config) {
    return Response.json({ error: `Unsupported platform: ${platform}` }, { status: 400 })
  }

  const clientId = process.env[config.clientIdEnv]
  if (!clientId) {
    return Response.json(
      { error: `${platform} OAuth is not configured. Please set ${config.clientIdEnv}.` },
      { status: 503 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const redirectUri = `${appUrl}/api/social/oauth/${platform}/callback`

  // Store state with user email for callback verification
  const state = Buffer.from(JSON.stringify({ email: authUser.email, ts: Date.now() })).toString("base64url")

  const url = new URL(config.authUrl)
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", config.scopes.join(" "))
  url.searchParams.set("state", state)

  // Platform-specific params
  if (platform === "twitter") {
    url.searchParams.set("code_challenge_method", "plain")
    url.searchParams.set("code_challenge", state)
  }

  return redirect(url.toString())
}
