import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/lib/plan-limits"
import type { Plan } from "@prisma/client"
import { z } from "zod"

const accountSchema = z.object({
  platform: z.enum(["TWITTER", "LINKEDIN", "INSTAGRAM", "FACEBOOK", "TIKTOK", "YOUTUBE"]),
  accountId: z.string().min(1),
  accountName: z.string().min(1),
  accountUrl: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  tokenExpiry: z.string().datetime().optional(),
})

async function getWorkspace(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  return dbUser?.workspaceMembers[0]?.workspace ?? null
}

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspace(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const accounts = await prisma.socialAccount.findMany({
      where: { workspaceId: workspace.id },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        accountUrl: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })

    return Response.json(accounts)
  } catch (err) {
    console.error("[GET /api/social/accounts]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const workspace = await getWorkspace(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const body = await req.json()
    const parsed = accountSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    const limits = PLAN_LIMITS[workspace.plan as Plan]
    if (limits.social !== -1) {
      const count = await prisma.socialAccount.count({ where: { workspaceId: workspace.id } })
      if (count >= limits.social) {
        return Response.json(
          { error: `Plan limit reached. Upgrade to connect more social accounts.` },
          { status: 402 }
        )
      }
    }

    const { tokenExpiry, ...rest } = parsed.data
    const account = await prisma.socialAccount.upsert({
      where: {
        workspaceId_platform_accountId: {
          workspaceId: workspace.id,
          platform: parsed.data.platform,
          accountId: parsed.data.accountId,
        },
      },
      update: {
        ...rest,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : undefined,
        isActive: true,
      },
      create: {
        ...rest,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : undefined,
        workspaceId: workspace.id,
      },
    })

    return Response.json(account, { status: 201 })
  } catch (err) {
    console.error("[POST /api/social/accounts]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
