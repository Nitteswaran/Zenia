import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { socialPostSchema } from "@/lib/validations/schemas"
import { PLAN_LIMITS } from "@/lib/plan-limits"
import type { Plan } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const platform = searchParams.get("platform") ?? undefined
    const status = searchParams.get("status") ?? undefined
    const campaignId = searchParams.get("campaignId") ?? undefined
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "20", 10))

    const where = {
      workspaceId: workspace.id,
      ...(platform ? { platform: platform as never } : {}),
      ...(status ? { status: status as never } : {}),
      ...(campaignId ? { campaignId } : {}),
    }

    const [posts, total] = await Promise.all([
      prisma.socialPost.findMany({
        where,
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { socialAccount: true, content: true },
      }),
      prisma.socialPost.count({ where }),
    ])

    return Response.json({ data: posts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (err) {
    console.error("[GET /api/social/posts]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    // Check plan limit for scheduled posts
    const plan = workspace.plan as Plan
    const limits = PLAN_LIMITS[plan]
    if (limits.social !== -1) {
      const connectedAccounts = await prisma.socialAccount.count({
        where: { workspaceId: workspace.id, isActive: true },
      })
      if (connectedAccounts >= limits.social) {
        return Response.json(
          { error: `Your ${plan} plan allows up to ${limits.social} connected social accounts. Please upgrade.` },
          { status: 402 }
        )
      }
    }

    const body = await req.json()
    const parsed = socialPostSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const post = await prisma.socialPost.create({
      data: {
        ...parsed.data,
        platform: parsed.data.platform as never,
        workspaceId: workspace.id,
        status: "DRAFT",
      },
    })

    return Response.json(post, { status: 201 })
  } catch (err) {
    console.error("[POST /api/social/posts]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
