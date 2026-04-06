import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { User, Workspace, WorkspaceMember } from '@prisma/client'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as never)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

export async function createSupabaseServiceClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as never)
            )
          } catch {
            // Ignore errors from Server Components
          }
        },
      },
    }
  )
}

export async function getAuthUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

export async function getSession() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) return null
  return session
}

// =============================================================================
// Shared workspace resolver — avoids repeating the 2-query auth+workspace
// lookup in every API route and server page.
// =============================================================================

type WorkspaceResult = {
  dbUser: User & { workspaceMembers: (WorkspaceMember & { workspace: Workspace })[] }
  workspace: Workspace
} | null

export async function getWorkspace(): Promise<WorkspaceResult> {
  const authUser = await getAuthUser()
  if (!authUser?.email) return null

  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email },
    include: {
      workspaceMembers: {
        include: { workspace: true },
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!dbUser || !workspace) return null

  return { dbUser, workspace }
}
