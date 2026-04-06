import * as React from "react"
import { Html, Head, Body, Container, Section, Text, Button, Hr, Img } from "@react-email/components"

interface WelcomeEmailProps {
  name: string
  workspaceName: string
  dashboardUrl: string
}

export function WelcomeEmail({ name, workspaceName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: "#0A0A0A", fontFamily: "Inter, system-ui, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
          <Section>
            <div style={{ width: 28, height: 28, backgroundColor: "#FF3D00", marginBottom: 32 }} />
          </Section>

          <Section>
            <Text style={{ color: "#FAFAFA", fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.2, margin: "0 0 16px" }}>
              Welcome to Zenia, {name}.
            </Text>
            <Text style={{ color: "#737373", fontSize: 16, lineHeight: 1.6, margin: "0 0 32px" }}>
              Your workspace <strong style={{ color: "#FAFAFA" }}>{workspaceName}</strong> is ready.
              Zenia is your AI marketing operating system — generate content, schedule posts, manage your pipeline,
              and automate your entire marketing stack from one place.
            </Text>
          </Section>

          <Section style={{ margin: "0 0 32px" }}>
            <Button
              href={dashboardUrl}
              style={{
                backgroundColor: "#FF3D00",
                color: "#FAFAFA",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "14px 28px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Open Your Dashboard
            </Button>
          </Section>

          <Hr style={{ borderColor: "#262626", margin: "32px 0" }} />

          <Section>
            <Text style={{ color: "#737373", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Get started with 25 free AI credits. Upgrade any time at zenia.ai/pricing.
            </Text>
            <Text style={{ color: "#737373", fontSize: 12, margin: "16px 0 0" }}>
              © {new Date().getFullYear()} Zenia · AI Marketing Operating System ·{" "}
              <a href="https://zenia.ai" style={{ color: "#FF3D00", textDecoration: "none" }}>zenia.ai</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

WelcomeEmail.PreviewProps = {
  name: "Alex",
  workspaceName: "Acme Corp",
  dashboardUrl: "https://app.zenia.ai/dashboard",
} satisfies WelcomeEmailProps

export default WelcomeEmail
