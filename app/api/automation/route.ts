import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { automationSchema } from "@/lib/validations/schemas"
import { PLAN_LIMITS } from "@/lib/plan-limits"
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

    const automations = await prisma.automation.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { logs: true } } },
    })
    return Response.json(automations)
  } catch (err) {
    console.error("[GET /api/automation]", err)
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

    const plan = workspace.plan as Plan
    const limit = PLAN_LIMITS[plan].automations
    if (limit !== -1) {
      const count = await prisma.automation.count({ where: { workspaceId: workspace.id } })
      if (count >= limit) {
        return Response.json({ error: `Your ${plan} plan allows up to ${limit} automations. Please upgrade.` }, { status: 402 })
      }
    }

    const body = await req.json()
    const parsed = automationSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const automation = await prisma.automation.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        trigger: parsed.data.trigger as never,
        steps: parsed.data.steps as never,
        workspaceId: workspace.id,
      },
    })
    return Response.json(automation, { status: 201 })
  } catch (err) {
    console.error("[POST /api/automation]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
