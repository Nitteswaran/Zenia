import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  // Get or create DB user + workspace
  let dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: {
      workspaceMembers: {
        include: { workspace: true },
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: authUser.email!,
        name: authUser.user_metadata?.full_name ?? null,
      },
      include: {
        workspaceMembers: { include: { workspace: true } },
      },
    })
  }

  let workspace = dbUser.workspaceMembers[0]?.workspace ?? null

  if (!workspace) {
    const slug = (authUser.email!.split("@")[0] ?? "workspace")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 40)

    const uniqueSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`

    workspace = await prisma.workspace.create({
      data: {
        name: `${dbUser.name ?? "My"}'s Workspace`,
        slug: uniqueSlug,
        members: {
          create: {
            userId: dbUser.id,
            role: "OWNER",
          },
        },
      },
    })
  }

  return (
    <DashboardShell
      user={{ name: dbUser.name, email: dbUser.email }}
      workspace={{ name: workspace.name, plan: workspace.plan }}
      creditsUsed={workspace.aiCreditsUsed}
      creditsLimit={workspace.aiCreditsLimit}
    >
      {children}
    </DashboardShell>
  )
}
