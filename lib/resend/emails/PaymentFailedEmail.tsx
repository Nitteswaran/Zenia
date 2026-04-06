import * as React from "react"
import { Html, Head, Body, Container, Section, Text, Button, Hr } from "@react-email/components"

interface PaymentFailedEmailProps {
  name: string
  amount: string
  updatePaymentUrl: string
}

export function PaymentFailedEmail({ name, amount, updatePaymentUrl }: PaymentFailedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: "#0A0A0A", fontFamily: "Inter, system-ui, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
          <Section>
            <div style={{ width: 28, height: 28, backgroundColor: "#FF3D00", marginBottom: 32 }} />
          </Section>

          <Section>
            <Text style={{ color: "#FF3D00", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 12px" }}>
              Action Required
            </Text>
            <Text style={{ color: "#FAFAFA", fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
              Payment failed, {name}.
            </Text>
            <Text style={{ color: "#737373", fontSize: 16, lineHeight: 1.6, margin: "0 0 32px" }}>
              We couldn't process your payment of <strong style={{ color: "#FAFAFA" }}>{amount}</strong>.
              Please update your payment method to avoid interruption to your Zenia workspace.
              Your account will be downgraded to the Free plan if payment isn't resolved within 7 days.
            </Text>
          </Section>

          <Section style={{ margin: "0 0 32px" }}>
            <Button
              href={updatePaymentUrl}
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
              Update Payment Method
            </Button>
          </Section>

          <Hr style={{ borderColor: "#262626", margin: "32px 0" }} />
          <Text style={{ color: "#737373", fontSize: 12, margin: 0 }}>
            Need help? Reply to this email or contact us at support@zenia.ai
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

PaymentFailedEmail.PreviewProps = {
  name: "Alex",
  amount: "$99.00",
  updatePaymentUrl: "https://app.zenia.ai/settings/billing",
} satisfies PaymentFailedEmailProps

export default PaymentFailedEmail
