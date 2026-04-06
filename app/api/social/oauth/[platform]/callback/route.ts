import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

const PLATFORM_TOKEN_URLS: Record<string, string> = {
  twitter: "https://api.twitter.com/2/oauth2/token",
  linkedin: "https://www.linkedin.com/oauth/v2/accessToken",
  instagram: "https://api.instagram.com/oauth/access_token",
  facebook: "https://graph.facebook.com/v19.0/oauth/access_token",
  tiktok: "https://open.tiktokapis.com/v2/oauth/token/",
  youtube: "https://oauth2.googleapis.com/token",
}

const CLIENT_CONFIG: Record<string, { clientIdEnv: string; clientSecretEnv: string }> = {
  twitter: { clientIdEnv: "TWITTER_CLIENT_ID", clientSecretEnv: "TWITTER_CLIENT_SECRET" },
  linkedin: { clientIdEnv: "LINKEDIN_CLIENT_ID", clientSecretEnv: "LINKEDIN_CLIENT_SECRET" },
  instagram: { clientIdEnv: "INSTAGRAM_APP_ID", clientSecretEnv: "INSTAGRAM_APP_SECRET" },
  facebook: { clientIdEnv: "FACEBOOK_APP_ID", clientSecretEnv: "FACEBOOK_APP_SECRET" },
  tiktok: { clientIdEnv: "TIKTOK_CLIENT_KEY", clientSecretEnv: "TIKTOK_CLIENT_SECRET" },
  youtube: { clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
}

const PLATFORM_ENUM: Record<string, string> = {
  twitter: "TWITTER",
  linkedin: "LINKEDIN",
  instagram: "INSTAGRAM",
  facebook: "FACEBOOK",
  tiktok: "TIKTOK",
  youtube: "YOUTUBE",
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return redirect("/social/accounts?error=oauth_denied")
  }

  try {
    const authUser = await getAuthUser()
    if (!authUser) return redirect("/login")

    const config = CLIENT_CONFIG[platform.toLowerCase()]
    if (!config) return redirect("/social/accounts?error=unsupported_platform")

    const clientId = process.env[config.clientIdEnv]
    const clientSecret = process.env[config.clientSecretEnv]
    if (!clientId || !clientSecret) return redirect("/social/accounts?error=not_configured")

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const redirectUri = `${appUrl}/api/social/oauth/${platform}/callback`
    const tokenUrl = PLATFORM_TOKEN_URLS[platform.toLowerCase()]

    // Exchange code for tokens
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    })

    if (!tokenRes.ok) {
      console.error(`[OAuth ${platform}] Token exchange failed:`, await tokenRes.text())
      return redirect("/social/accounts?error=token_exchange_failed")
    }

    const tokens = await tokenRes.json() as {
      access_token: string
      refresh_token?: string
      expires_in?: number
    }

    // Get workspace
    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return redirect("/social/accounts?error=no_workspace")

    // Fetch platform profile for account name/ID
    let accountId = authUser.email!
    let accountName = authUser.email!

    try {
      if (platform === "twitter") {
        const me = await fetch("https://api.twitter.com/2/users/me", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        })
        const data = await me.json() as { data: { id: string; name: string; username: string } }
        accountId = data.data.id
        accountName = `@${data.data.username}`
      } else if (platform === "linkedin") {
        const me = await fetch("https://api.linkedin.com/v2/me", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        })
        const data = await me.json() as { id: string; localizedFirstName: string; localizedLastName: string }
        accountId = data.id
        accountName = `${data.localizedFirstName} ${data.localizedLastName}`
      } else if (platform === "youtube") {
        const me = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        })
        const data = await me.json() as { items: { id: string; snippet: { title: string } }[] }
        if (data.items?.[0]) {
          accountId = data.items[0].id
          accountName = data.items[0].snippet.title
        }
      }
    } catch {
      // Continue with fallback values if profile fetch fails
    }

    const tokenExpiry = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : undefined

    await prisma.socialAccount.upsert({
      where: {
        workspaceId_platform_accountId: {
          workspaceId: workspace.id,
          platform: PLATFORM_ENUM[platform.toLowerCase()] as never,
          accountId,
        },
      },
      update: {
        accountName,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry,
        isActive: true,
      },
      create: {
        workspaceId: workspace.id,
        platform: PLATFORM_ENUM[platform.toLowerCase()] as never,
        accountId,
        accountName,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry,
      },
    })

    return redirect("/social/accounts?success=connected")
  } catch (err) {
    console.error(`[OAuth ${platform} callback]`, err)
    return redirect("/social/accounts?error=internal_error")
  }
}
