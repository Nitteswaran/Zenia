import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import Image, { type StaticImageData } from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

import hubspotLogo from "@/assets/integration_logo/hubspot_logo.png"
import mailchimpLogo from "@/assets/integration_logo/mailchimp_logo.png"
import googleAnalyticsLogo from "@/assets/integration_logo/Google_analytics.png"
import slackLogo from "@/assets/integration_logo/slack_logo.png"
import zapierLogo from "@/assets/integration_logo/images.png"
import notionLogo from "@/assets/integration_logo/notion_logo.png"
import salesforceLogo from "@/assets/integration_logo/Salesforce_logo.png"

export const metadata: Metadata = { title: "Integrations — Zenia", description: "Connect all your marketing tools." }

const INTEGRATIONS: { provider: string; name: string; desc: string; plan: string; logo: StaticImageData }[] = [
  { provider: "HUBSPOT", name: "HubSpot", desc: "Sync contacts and deals bidirectionally", plan: "GROWTH", logo: hubspotLogo },
  { provider: "MAILCHIMP", name: "Mailchimp", desc: "Sync contact lists and email campaigns", plan: "GROWTH", logo: mailchimpLogo },
  { provider: "GOOGLE_ANALYTICS", name: "Google Analytics", desc: "Pull website traffic and conversion data", plan: "GROWTH", logo: googleAnalyticsLogo },
  { provider: "SLACK", name: "Slack", desc: "Send workflow notifications to your team", plan: "STARTER", logo: slackLogo },
  { provider: "ZAPIER", name: "Zapier", desc: "Connect to 5,000+ apps via Zapier webhooks", plan: "STARTER", logo: zapierLogo },
  { provider: "NOTION", name: "Notion", desc: "Save generated content to Notion pages", plan: "GROWTH", logo: notionLogo },
  { provider: "SALESFORCE", name: "Salesforce", desc: "Full CRM sync with bidirectional data flow", plan: "BUSINESS", logo: salesforceLogo },
]

const planOrder: Record<string, number> = { FREE: 0, STARTER: 1, GROWTH: 2, BUSINESS: 3, ENTERPRISE: 4 }

export default async function IntegrationsPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: { workspaceMembers: { include: { workspace: true }, take: 1 } },
  })
  const workspace = dbUser?.workspaceMembers[0]?.workspace
  if (!workspace) redirect("/login")

  const connectedIntegrations = await prisma.integration.findMany({
    where: { workspaceId: workspace.id },
  })

  type ConnectedItem = { status: string; provider: string }
  const connectedSet = new Set(
    (connectedIntegrations as ConnectedItem[])
      .filter((item) => item.status === "CONNECTED")
      .map((item) => item.provider)
  )
  const currentPlanOrder = planOrder[workspace.plan] ?? 0

  return (
    <div className="space-y-6">
      <div>
        <div className="h-px w-12 bg-accent mb-3" />
        <h1 className="font-display text-3xl font-medium tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-1 text-sm">Connect the tools you already use. {connectedSet.size} connected.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration) => {
          const isConnected = connectedSet.has(integration.provider)
          const requiredPlanOrder = planOrder[integration.plan] ?? 0
          const locked = currentPlanOrder < requiredPlanOrder

          return (
            <div key={integration.provider} className={`border border-border bg-card p-5 space-y-4 relative ${locked ? "opacity-60" : ""}`}>
              {locked && (
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary">{integration.plan}+</Badge>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 border border-border bg-white flex items-center justify-center p-1.5">
                  <Image
                    src={integration.logo}
                    alt={integration.name}
                    width={28}
                    height={28}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{integration.name}</p>
                  {isConnected && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                      <span className="text-xs text-green-400 font-mono">Connected</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{integration.desc}</p>
              <Button
                variant={isConnected ? "ghost" : "secondary"}
                size="sm"
                className="w-full"
                disabled={locked}
              >
                {locked ? (
                  <>Upgrade to {integration.plan}</>
                ) : isConnected ? (
                  <>Disconnect</>
                ) : (
                  <>Connect <ExternalLink className="h-3 w-3 ml-1.5" strokeWidth={1.5} /></>
                )}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
