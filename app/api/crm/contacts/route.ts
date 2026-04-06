import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { contactSchema } from "@/lib/validations/schemas"
import { PLAN_LIMITS } from "@/lib/plan-limits"
import { fireTrigger } from "@/lib/automation/trigger"
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
    const status = searchParams.get("status") ?? undefined
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "25", 10))

    const where = {
      workspaceId: workspace.id,
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { company: { select: { id: true, name: true } }, _count: { select: { deals: true, activities: true } } },
      }),
      prisma.contact.count({ where }),
    ])

    return Response.json({ data: contacts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (err) {
    console.error("[GET /api/crm/contacts]", err)
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

    // Enforce plan limit
    const plan = workspace.plan as Plan
    const limit = PLAN_LIMITS[plan].contacts
    if (limit !== -1) {
      const count = await prisma.contact.count({ where: { workspaceId: workspace.id } })
      if (count >= limit) {
        return Response.json(
          { error: `Your ${plan} plan allows up to ${limit} contacts. Please upgrade.` },
          { status: 402 }
        )
      }
    }

    const body = await req.json()
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: { ...parsed.data, workspaceId: workspace.id },
    })

    // Fire automation trigger (non-blocking)
    void fireTrigger(workspace.id, "contact_created", {
      contactId: contact.id,
      triggerData: { email: contact.email, firstName: contact.firstName, lastName: contact.lastName },
    })

    return Response.json(contact, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return Response.json({ error: "A contact with this email already exists" }, { status: 409 })
    }
    console.error("[POST /api/crm/contacts]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
