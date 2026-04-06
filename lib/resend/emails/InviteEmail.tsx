import * as React from "react"
import { Html, Head, Body, Container, Section, Text, Button, Hr } from "@react-email/components"

interface InviteEmailProps {
  inviteeName: string
  inviterName: string
  workspaceName: string
  role: string
  inviteUrl: string
}

export function InviteEmail({ inviteeName, inviterName, workspaceName, role, inviteUrl }: InviteEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: "#0A0A0A", fontFamily: "Inter, system-ui, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
          <Section>
            <div style={{ width: 28, height: 28, backgroundColor: "#FF3D00", marginBottom: 32 }} />
          </Section>

          <Section>
            <Text style={{ color: "#FAFAFA", fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
              You&apos;ve been invited.
            </Text>
            <Text style={{ color: "#737373", fontSize: 16, lineHeight: 1.6, margin: "0 0 8px" }}>
              <strong style={{ color: "#FAFAFA" }}>{inviterName}</strong> invited you to join{" "}
              <strong style={{ color: "#FAFAFA" }}>{workspaceName}</strong> on Zenia as a{" "}
              <strong style={{ color: "#FAFAFA" }}>{role}</strong>.
            </Text>
            {inviteeName && (
              <Text style={{ color: "#737373", fontSize: 14, margin: "0 0 32px" }}>
                Hi {inviteeName}, click the button below to accept the invitation.
              </Text>
            )}
          </Section>

          <Section style={{ margin: "0 0 32px" }}>
            <Button
              href={inviteUrl}
              style={{
                backgroundColor: "#FF3D00",
                color: "#FAFAFA",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "14px 28px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Accept Invitation
            </Button>
          </Section>

          <Hr style={{ borderColor: "#262626", margin: "32px 0" }} />
          <Text style={{ color: "#737373", fontSize: 12, margin: 0 }}>
            This invitation expires in 7 days. If you didn&apos;t expect this email, you can safely ignore it.
          </Text>
          <Text style={{ color: "#737373", fontSize: 12, margin: "16px 0 0" }}>
            © {new Date().getFullYear()} Zenia ·{" "}
            <a href="https://zenia.ai" style={{ color: "#FF3D00", textDecoration: "none" }}>zenia.ai</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

InviteEmail.PreviewProps = {
  inviteeName: "Sam",
  inviterName: "Alex Chen",
  workspaceName: "Acme Corp",
  role: "Member",
  inviteUrl: "https://app.zenia.ai/invite/abc123",
} satisfies InviteEmailProps

export default InviteEmail
