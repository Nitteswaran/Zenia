import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
})

async function getWorkspaceWithRole(email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: {
      workspaceMembers: {
        include: { workspace: true },
        take: 1,
      },
    },
  })
  const member = dbUser?.workspaceMembers[0]
  return { workspace: member?.workspace ?? null, role: member?.role ?? null, user: dbUser }
}

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { workspace } = await getWorkspaceWithRole(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: { select: { id: true, email: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    return Response.json(members)
  } catch (err) {
    console.error("[GET /api/team]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { workspace, role } = await getWorkspaceWithRole(authUser.email!)
    if (!workspace) return Response.json({ error: "Workspace not found" }, { status: 404 })
    if (role !== "OWNER" && role !== "ADMIN") {
      return Response.json({ error: "Only owners and admins can invite members" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    const { email, role: inviteRole } = parsed.data

    // Get or create user record
    let invitedUser = await prisma.user.findUnique({ where: { email } })
    if (!invitedUser) {
      invitedUser = await prisma.user.create({ data: { email } })
    }

    // Check not already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: invitedUser.id, workspaceId: workspace.id } },
    })
    if (existing) {
      return Response.json({ error: "User is already a member of this workspace" }, { status: 409 })
    }

    const member = await prisma.workspaceMember.create({
      data: { userId: invitedUser.id, workspaceId: workspace.id, role: inviteRole },
      include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
    })

    // Send invite email
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@zenia.ai",
        to: email,
        subject: `You've been invited to ${workspace.name} on Zenia`,
        html: `<p>You've been invited to join <strong>${workspace.name}</strong> on Zenia. <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.zenia.ai"}/login">Sign in to accept.</a></p>`,
      }).catch((e) => console.error("Failed to send invite email", e))
    }

    return Response.json(member, { status: 201 })
  } catch (err) {
    console.error("[POST /api/team]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
