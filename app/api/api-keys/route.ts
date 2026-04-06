import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { apiKeySchema } from "@/lib/validations/schemas"
import { PLAN_LIMITS } from "@/lib/plan-limits"
import { createHash, randomBytes } from "crypto"
import type { Plan } from "@prisma/client"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
    })
    const workspace = dbUser?.workspaceMembers[0]?.workspace
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const keys = await prisma.apiKey.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true,
      },
    })

    return Response.json(keys)
  } catch (err) {
    console.error("[GET /api/api-keys]", err)
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
    if (!workspace || !dbUser) return Response.json({ error: "Workspace not found" }, { status: 404 })

    // Enforce plan limit
    const plan = workspace.plan as Plan
    const limit = PLAN_LIMITS[plan].apiKeys
    if (limit === 0) {
      return Response.json(
        { error: "API key access requires Growth plan or higher. Please upgrade." },
        { status: 402 }
      )
    }
    if (limit !== -1) {
      const count = await prisma.apiKey.count({ where: { workspaceId: workspace.id } })
      if (count >= limit) {
        return Response.json(
          { error: `Your ${plan} plan allows up to ${limit} API keys. Please upgrade.` },
          { status: 402 }
        )
      }
    }

    const body = await req.json()
    const parsed = apiKeySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    // Generate a secure random key
    const rawKey = `zenia_${randomBytes(32).toString("hex")}`
    const keyHash = createHash("sha256").update(rawKey).digest("hex")
    const keyPrefix = rawKey.slice(0, 12) // "zenia_" + first 6 chars

    const apiKey = await prisma.apiKey.create({
      data: {
        name: parsed.data.name,
        keyHash,
        keyPrefix,
        userId: dbUser.id,
        workspaceId: workspace.id,
      },
    })

    // Return the raw key ONCE — it cannot be retrieved again
    return Response.json(
      {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        key: rawKey, // shown only on creation
        createdAt: apiKey.createdAt,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("[POST /api/api-keys]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
