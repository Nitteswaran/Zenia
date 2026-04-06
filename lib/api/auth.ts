import { NextRequest } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import type { Workspace } from "@prisma/client"

/**
 * Validates a Bearer API key from the Authorization header.
 * Increments usage count on successful validation.
 * Returns the workspace the key belongs to, or null if invalid.
 */
export async function validateApiKey(req: NextRequest): Promise<Workspace | null> {
  const auth = req.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null

  const rawKey = auth.slice(7).trim()
  if (!rawKey.startsWith("zenia_")) return null

  const keyHash = createHash("sha256").update(rawKey).digest("hex")

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { workspace: true },
  })

  if (!apiKey) return null

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
  })

  return apiKey.workspace
}
