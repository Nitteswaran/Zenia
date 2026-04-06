import { NextRequest } from "next/server"
import { validateApiKey } from "@/lib/api/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const workspace = await validateApiKey(req)
  if (!workspace) return Response.json({ error: "Invalid or missing API key" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "25", 10))
  const status = searchParams.get("status") ?? undefined

  const where = { workspaceId: workspace.id, ...(status ? { status: status as never } : {}) }

  const [data, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { analytics: true },
    }),
    prisma.campaign.count({ where }),
  ])

  return Response.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}
