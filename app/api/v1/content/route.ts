import { NextRequest } from "next/server"
import { validateApiKey } from "@/lib/api/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const workspace = await validateApiKey(req)
  if (!workspace) return Response.json({ error: "Invalid or missing API key" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "25", 10))

  const [data, total] = await Promise.all([
    prisma.content.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, title: true, type: true, platform: true, status: true, tags: true, aiGenerated: true, createdAt: true, updatedAt: true },
    }),
    prisma.content.count({ where: { workspaceId: workspace.id } }),
  ])

  return Response.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}
