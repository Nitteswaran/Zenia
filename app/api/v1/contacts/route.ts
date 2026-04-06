import { NextRequest } from "next/server"
import { validateApiKey } from "@/lib/api/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const workspace = await validateApiKey(req)
  if (!workspace) return Response.json({ error: "Invalid or missing API key" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "25", 10))
  const search = searchParams.get("search") ?? ""

  const where = {
    workspaceId: workspace.id,
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

  const [data, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, firstName: true, lastName: true, email: true, status: true, score: true, tags: true, createdAt: true },
    }),
    prisma.contact.count({ where }),
  ])

  return Response.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}
