import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

/**
 * Verifies the caller is authenticated and has Role.SUPER_ADMIN.
 * Returns the dbUser on success, or a Response on failure.
 */
export async function requireSuperAdmin(): Promise<
  { ok: true; dbUser: NonNullable<Awaited<ReturnType<typeof getSuperAdminUser>>> } |
  { ok: false; response: Response }
> {
  const authUser = await getAuthUser()
  if (!authUser?.email) {
    return { ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const dbUser = await getSuperAdminUser(authUser.email)
  if (!dbUser) {
    return { ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  if (dbUser.role !== "SUPER_ADMIN") {
    return { ok: false, response: Response.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { ok: true, dbUser }
}

async function getSuperAdminUser(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  })
}
