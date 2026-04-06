import * as React from "react"
import { Html, Head, Body, Container, Section, Text, Button, Hr } from "@react-email/components"

interface WeeklyReportEmailProps {
  name: string
  workspaceName: string
  period: string
  stats: {
    contentGenerated: number
    postsPublished: number
    newContacts: number
    activeDeals: number
    aiCreditsUsed: number
    aiCreditsLimit: number
  }
  dashboardUrl: string
}

export function WeeklyReportEmail({
  name,
  workspaceName,
  period,
  stats,
  dashboardUrl,
}: WeeklyReportEmailProps) {
  const metrics: { label: string; value: string }[] = [
    { label: "Content Generated", value: String(stats.contentGenerated) },
    { label: "Posts Published", value: String(stats.postsPublished) },
    { label: "New Contacts", value: String(stats.newContacts) },
    { label: "Active Deals", value: String(stats.activeDeals) },
    { label: "AI Credits Used", value: `${stats.aiCreditsUsed} / ${stats.aiCreditsLimit}` },
  ]

  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: "#0A0A0A", fontFamily: "Inter, system-ui, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
          <Section>
            <div style={{ width: 28, height: 28, backgroundColor: "#FF3D00", marginBottom: 32 }} />
          </Section>

          <Section>
            <Text style={{ color: "#737373", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 8px" }}>
              {workspaceName} · {period}
            </Text>
            <Text style={{ color: "#FAFAFA", fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 32px" }}>
              Your weekly report, {name}.
            </Text>
          </Section>

          <Section style={{ border: "1px solid #262626", padding: "24px", marginBottom: 32 }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1A1A1A" }}>
                <Text style={{ color: "#737373", fontSize: 14, margin: 0 }}>{m.label}</Text>
                <Text style={{ color: "#FAFAFA", fontSize: 14, fontWeight: 600, margin: 0 }}>{m.value}</Text>
              </div>
            ))}
          </Section>

          <Section style={{ margin: "0 0 32px" }}>
            <Button
              href={dashboardUrl}
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
              View Full Analytics
            </Button>
          </Section>

          <Hr style={{ borderColor: "#262626", margin: "32px 0" }} />
          <Text style={{ color: "#737373", fontSize: 12, margin: 0 }}>
            You're receiving this because weekly reports are enabled in your notification settings.{" "}
            <a href={`${dashboardUrl.replace("/dashboard", "/settings")}`} style={{ color: "#FF3D00", textDecoration: "none" }}>
              Manage preferences
            </a>
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

WeeklyReportEmail.PreviewProps = {
  name: "Alex",
  workspaceName: "Acme Corp",
  period: "Apr 1 – Apr 7, 2026",
  stats: {
    contentGenerated: 14,
    postsPublished: 8,
    newContacts: 23,
    activeDeals: 5,
    aiCreditsUsed: 42,
    aiCreditsLimit: 200,
  },
  dashboardUrl: "https://app.zenia.ai/dashboard",
} satisfies WeeklyReportEmailProps

export default WeeklyReportEmail
