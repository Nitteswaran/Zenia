import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { companySchema } from "@/lib/validations/schemas"
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
    const search = searchParams.get("search") ?? ""
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "25", 10))

    const where = {
      workspaceId: workspace.id,
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { contacts: true, deals: true } } },
      }),
      prisma.company.count({ where }),
    ])

    return Response.json({ data: companies, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (err) {
    console.error("[GET /api/crm/companies]", err)
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
    const limit = PLAN_LIMITS[plan].companies
    if (limit !== -1) {
      const count = await prisma.company.count({ where: { workspaceId: workspace.id } })
      if (count >= limit) {
        return Response.json(
          { error: `Your ${plan} plan allows up to ${limit} companies. Please upgrade.` },
          { status: 402 }
        )
      }
    }

    const body = await req.json()
    const parsed = companySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const company = await prisma.company.create({
      data: { ...parsed.data, workspaceId: workspace.id },
    })

    return Response.json(company, { status: 201 })
  } catch (err) {
    console.error("[POST /api/crm/companies]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
