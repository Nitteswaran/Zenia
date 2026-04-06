import * as React from "react"
import { Html, Head, Body, Container, Section, Text, Button, Hr } from "@react-email/components"

interface UpgradeEmailProps {
  name: string
  newPlan: string
  dashboardUrl: string
}

export function UpgradeEmail({ name, newPlan, dashboardUrl }: UpgradeEmailProps) {
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
              You're on {newPlan}, {name}.
            </Text>
            <Text style={{ color: "#737373", fontSize: 16, lineHeight: 1.6, margin: "0 0 32px" }}>
              Your Zenia workspace has been upgraded to <strong style={{ color: "#FAFAFA" }}>{newPlan}</strong>.
              Your new limits and features are live immediately — no restart required.
            </Text>
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
              Go to Dashboard
            </Button>
          </Section>

          <Hr style={{ borderColor: "#262626", margin: "32px 0" }} />
          <Text style={{ color: "#737373", fontSize: 12, margin: 0 }}>
            Questions? Contact us at support@zenia.ai
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

UpgradeEmail.PreviewProps = {
  name: "Alex",
  newPlan: "Growth",
  dashboardUrl: "https://app.zenia.ai/dashboard",
} satisfies UpgradeEmailProps

export default UpgradeEmail
