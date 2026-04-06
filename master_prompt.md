You are an expert full-stack developer. Build a complete, production-ready
AI Marketing Operating System called "Zenia" targeting global markets. Zenia is NOT just another marketing tool —
it is a full operating system for marketing, where AI agents work
autonomously, workflows run automatically, and every marketing function
lives in one unified dashboard. Think of it as the "iOS for marketing teams."

Zenia's core philosophy:
- One dashboard to replace every marketing tool
- AI agents that execute tasks autonomously, not just assist
- Connect, sync and orchestrate all existing marketing tools
- Automate entire marketing workflows end-to-end
- Works for any business — from solo founders to enterprise teams

═══════════════════════════════════════════════════════════════
TECH STACK (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════

Framework:        Next.js 15 (App Router, TypeScript strict mode)
Styling:          Tailwind CSS v4 + shadcn/ui (latest)
Database:         Supabase (PostgreSQL) + Prisma ORM
Auth:             Supabase Auth (email/password + Google + LinkedIn OAuth)
AI:               Vercel AI SDK + Anthropic claude-sonnet-4-20250514
AI Agents:        Vercel AI SDK useChat + multi-step tool calling
Email:            Resend + React Email
Payments:         Stripe (subscriptions + usage billing)
Analytics:        PostHog
Storage:          Supabase Storage
Scheduling:       Upstash QStash (social post scheduling)
Rate Limiting:    Upstash Redis
State:            Zustand (global) + TanStack Query (server state)
Forms:            React Hook Form + Zod
Tables:           TanStack Table
Rich Text:        Tiptap
Charts:           Recharts
Drag & Drop:      @dnd-kit/core
Deployment:       Vercel

═══════════════════════════════════════════════════════════════
PROJECT STRUCTURE
═══════════════════════════════════════════════════════════════

zenia/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               ← Protected layout + sidebar
│   │   ├── dashboard/page.tsx       ← Command centre overview
│   │   ├── zenia-ai/
│   │   │   └── page.tsx             ← AI Agent chat interface
│   │   ├── content/
│   │   │   ├── page.tsx             ← Content library
│   │   │   └── generate/page.tsx    ← AI content generator
│   │   ├── campaigns/
│   │   │   ├── page.tsx             ← All campaigns
│   │   │   ├── new/page.tsx         ← Campaign wizard
│   │   │   └── [id]/page.tsx        ← Campaign detail
│   │   ├── social/
│   │   │   ├── page.tsx             ← Social media hub
│   │   │   ├── compose/page.tsx     ← Post composer
│   │   │   ├── calendar/page.tsx    ← Content calendar
│   │   │   └── accounts/page.tsx    ← Connected accounts
│   │   ├── crm/
│   │   │   ├── page.tsx             ← CRM overview
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx         ← Contact list
│   │   │   │   └── [id]/page.tsx    ← Contact detail
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── pipeline/page.tsx    ← Deal pipeline (Kanban)
│   │   ├── automation/
│   │   │   ├── page.tsx             ← Workflow list
│   │   │   └── [id]/page.tsx        ← Workflow builder
│   │   ├── analytics/
│   │   │   ├── page.tsx             ← Analytics overview
│   │   │   ├── content/page.tsx     ← Content analytics
│   │   │   ├── social/page.tsx      ← Social analytics
│   │   │   └── campaigns/page.tsx   ← Campaign analytics
│   │   ├── integrations/page.tsx    ← All integrations
│   │   ├── team/page.tsx            ← Team management
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── billing/page.tsx
│   │       ├── api-keys/page.tsx
│   │       └── workspace/page.tsx
│   ├── (marketing)/
│   │   ├── page.tsx                 ← Landing page
│   │   ├── pricing/page.tsx
│   │   ├── features/page.tsx
│   │   ├── about/page.tsx
│   │   └── blog/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   └── api/
│       ├── ai/
│       │   ├── agent/route.ts           ← Zenia AI agent (streaming + tools)
│       │   ├── generate/route.ts        ← Content generation
│       │   ├── campaign/route.ts        ← Campaign builder
│       │   └── analyse/route.ts         ← Content/campaign analyser
│       ├── social/
│       │   ├── publish/route.ts         ← Publish to social platforms
│       │   ├── schedule/route.ts        ← Schedule posts via QStash
│       │   └── analytics/route.ts       ← Fetch platform analytics
│       ├── automation/
│       │   └── trigger/route.ts         ← Workflow trigger handler
│       ├── webhooks/
│       │   ├── stripe/route.ts
│       │   ├── qstash/route.ts          ← Scheduled post execution
│       │   └── resend/route.ts
│       └── v1/                          ← Public REST API
│           ├── content/route.ts
│           ├── campaigns/route.ts
│           ├── contacts/route.ts
│           └── analytics/route.ts
├── components/
│   ├── ui/                              ← shadcn components
│   ├── dashboard/
│   │   ├── Sidebar.tsx                  ← Collapsible sidebar
│   │   ├── Header.tsx
│   │   ├── CommandPalette.tsx           ← Cmd+K global search
│   │   ├── NotificationCenter.tsx
│   │   └── StatsCard.tsx
│   ├── ai/
│   │   ├── AgentChat.tsx                ← Full AI agent interface
│   │   ├── ContentGenerator.tsx         ← Streaming content gen
│   │   ├── CampaignWizard.tsx
│   │   └── AgentTaskCard.tsx            ← Running agent task UI
│   ├── social/
│   │   ├── PostComposer.tsx             ← Multi-platform composer
│   │   ├── ContentCalendar.tsx          ← Drag-drop calendar
│   │   ├── PlatformPreview.tsx          ← Platform-specific preview
│   │   └── AccountCard.tsx
│   ├── crm/
│   │   ├── ContactTable.tsx
│   │   ├── DealPipeline.tsx             ← Kanban board
│   │   ├── ContactDetail.tsx
│   │   └── ActivityTimeline.tsx
│   ├── automation/
│   │   ├── WorkflowBuilder.tsx          ← Visual workflow builder
│   │   ├── TriggerNode.tsx
│   │   ├── ActionNode.tsx
│   │   └── ConditionNode.tsx
│   ├── analytics/
│   │   ├── MetricsGrid.tsx
│   │   ├── PerformanceChart.tsx
│   │   └── PlatformBreakdown.tsx
│   ├── billing/
│   │   ├── PricingTable.tsx
│   │   ├── UsageBar.tsx
│   │   └── UpgradeModal.tsx
│   └── marketing/
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── HowItWorks.tsx
│       ├── Testimonials.tsx
│       └── IntegrationsShowcase.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── plans.ts
│   ├── ai/
│   │   ├── client.ts
│   │   ├── prompts.ts
│   │   └── tools.ts                     ← AI agent tool definitions
│   ├── social/
│   │   ├── linkedin.ts
│   │   ├── instagram.ts
│   │   ├── facebook.ts
│   │   ├── twitter.ts
│   │   ├── tiktok.ts
│   │   └── youtube.ts
│   ├── automation/
│   │   └── engine.ts                    ← Workflow execution engine
│   ├── resend/
│   │   └── emails/
│   │       ├── WelcomeEmail.tsx
│   │       ├── UpgradeEmail.tsx
│   │       ├── WeeklyReportEmail.tsx
│   │       ├── PaymentFailedEmail.tsx
│   │       └── InviteEmail.tsx
│   ├── plan-limits.ts
│   ├── validations/schemas.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── middleware.ts
└── types/index.ts

═══════════════════════════════════════════════════════════════
DATABASE SCHEMA (Prisma - Complete)
═══════════════════════════════════════════════════════════════

model User {
  id                String          @id @default(cuid())
  email             String          @unique
  name              String?
  avatarUrl         String?
  role              Role            @default(MEMBER)
  stripeCustomerId  String?         @unique
  onboardingDone    Boolean         @default(false)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  workspaceMembers  WorkspaceMember[]
  apiKeys           ApiKey[]
  notifications     Notification[]
}

model Workspace {
  id              String          @id @default(cuid())
  name            String
  slug            String          @unique
  logoUrl         String?
  website         String?
  industry        String?
  plan            Plan            @default(FREE)
  stripeSubId     String?         @unique
  aiCreditsUsed   Int             @default(0)
  aiCreditsLimit  Int             @default(25)
  timezone        String          @default("UTC")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  members         WorkspaceMember[]
  campaigns       Campaign[]
  content         Content[]
  contacts        Contact[]
  companies       Company[]
  deals           Deal[]
  socialAccounts  SocialAccount[]
  socialPosts     SocialPost[]
  automations     Automation[]
  integrations    Integration[]
  apiKeys         ApiKey[]
}

model WorkspaceMember {
  id          String        @id @default(cuid())
  userId      String
  workspaceId String
  role        WorkspaceRole @default(MEMBER)
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  createdAt   DateTime      @default(now())
  @@unique([userId, workspaceId])
}

model Campaign {
  id              String            @id @default(cuid())
  name            String
  description     String?
  status          CampaignStatus    @default(DRAFT)
  type            CampaignType
  goal            String?
  targetAudience  Json?
  startDate       DateTime?
  endDate         DateTime?
  budget          Float?
  channels        String[]
  aiGenerated     Boolean           @default(false)
  workspaceId     String
  workspace       Workspace         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  content         Content[]
  socialPosts     SocialPost[]
  analytics       CampaignAnalytics?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

model Content {
  id            String          @id @default(cuid())
  title         String
  body          String          @db.Text
  type          ContentType
  platform      Platform?
  status        ContentStatus   @default(DRAFT)
  aiGenerated   Boolean         @default(false)
  metadata      Json?
  tags          String[]
  campaignId    String?
  workspaceId   String
  campaign      Campaign?       @relation(fields: [campaignId], references: [id])
  workspace     Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  socialPosts   SocialPost[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model SocialAccount {
  id            String        @id @default(cuid())
  platform      SocialPlatform
  accountId     String
  accountName   String
  accountUrl    String?
  avatarUrl     String?
  accessToken   String        @db.Text
  refreshToken  String?       @db.Text
  tokenExpiry   DateTime?
  isActive      Boolean       @default(true)
  workspaceId   String
  workspace     Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  posts         SocialPost[]
  createdAt     DateTime      @default(now())
  @@unique([workspaceId, platform, accountId])
}

model SocialPost {
  id              String          @id @default(cuid())
  caption         String          @db.Text
  mediaUrls       String[]
  platform        SocialPlatform
  status          PostStatus      @default(DRAFT)
  scheduledAt     DateTime?
  publishedAt     DateTime?
  qstashMessageId String?
  platformPostId  String?
  metrics         Json?
  workspaceId     String
  socialAccountId String?
  contentId       String?
  campaignId      String?
  workspace       Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  socialAccount   SocialAccount?  @relation(fields: [socialAccountId], references: [id])
  content         Content?        @relation(fields: [contentId], references: [id])
  campaign        Campaign?       @relation(fields: [campaignId], references: [id])
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Contact {
  id            String        @id @default(cuid())
  firstName     String?
  lastName      String?
  email         String
  phone         String?
  title         String?
  source        String?
  status        ContactStatus @default(NEW)
  score         Int           @default(0)
  tags          String[]
  notes         String?       @db.Text
  metadata      Json?
  companyId     String?
  workspaceId   String
  company       Company?      @relation(fields: [companyId], references: [id])
  workspace     Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  deals         Deal[]
  activities    Activity[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  @@unique([workspaceId, email])
}

model Company {
  id            String      @id @default(cuid())
  name          String
  domain        String?
  industry      String?
  size          String?
  website       String?
  logoUrl       String?
  notes         String?     @db.Text
  workspaceId   String
  workspace     Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  contacts      Contact[]
  deals         Deal[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Deal {
  id            String      @id @default(cuid())
  title         String
  value         Float       @default(0)
  currency      String      @default("USD")
  stage         DealStage   @default(LEAD)
  probability   Int         @default(0)
  closeDate     DateTime?
  notes         String?     @db.Text
  workspaceId   String
  contactId     String?
  companyId     String?
  workspace     Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  contact       Contact?    @relation(fields: [contactId], references: [id])
  company       Company?    @relation(fields: [companyId], references: [id])
  activities    Activity[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Activity {
  id          String        @id @default(cuid())
  type        ActivityType
  title       String
  description String?       @db.Text
  metadata    Json?
  contactId   String?
  dealId      String?
  contact     Contact?      @relation(fields: [contactId], references: [id])
  deal        Deal?         @relation(fields: [dealId], references: [id])
  createdAt   DateTime      @default(now())
}

model Automation {
  id            String            @id @default(cuid())
  name          String
  description   String?
  status        AutomationStatus  @default(INACTIVE)
  trigger       Json              // TriggerConfig object
  steps         Json              // AutomationStep[] array
  runCount      Int               @default(0)
  lastRunAt     DateTime?
  workspaceId   String
  workspace     Workspace         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  logs          AutomationLog[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model AutomationLog {
  id            String          @id @default(cuid())
  automationId  String
  status        RunStatus
  input         Json?
  output        Json?
  error         String?
  duration      Int?            // milliseconds
  automation    Automation      @relation(fields: [automationId], references: [id], onDelete: Cascade)
  createdAt     DateTime        @default(now())
}

model Integration {
  id            String            @id @default(cuid())
  provider      IntegrationProvider
  status        IntegrationStatus @default(DISCONNECTED)
  accessToken   String?           @db.Text
  refreshToken  String?           @db.Text
  tokenExpiry   DateTime?
  config        Json?
  lastSyncAt    DateTime?
  workspaceId   String
  workspace     Workspace         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  @@unique([workspaceId, provider])
}

model CampaignAnalytics {
  id            String    @id @default(cuid())
  campaignId    String    @unique
  impressions   Int       @default(0)
  clicks        Int       @default(0)
  conversions   Int       @default(0)
  spend         Float     @default(0)
  revenue       Float     @default(0)
  ctr           Float     @default(0)
  roas          Float     @default(0)
  campaign      Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  updatedAt     DateTime  @updatedAt
}

model ApiKey {
  id          String      @id @default(cuid())
  name        String
  keyHash     String      @unique
  keyPrefix   String
  lastUsedAt  DateTime?
  usageCount  Int         @default(0)
  userId      String
  workspaceId String
  user        User        @relation(fields: [userId], references: [id])
  workspace   Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  createdAt   DateTime    @default(now())
}

model Notification {
  id        String    @id @default(cuid())
  userId    String
  title     String
  body      String
  type      String
  read      Boolean   @default(false)
  metadata  Json?
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
}

enum Role                { SUPER_ADMIN ADMIN MEMBER }
enum WorkspaceRole       { OWNER ADMIN MEMBER VIEWER }
enum Plan                { FREE STARTER GROWTH BUSINESS ENTERPRISE }
enum CampaignStatus      { DRAFT ACTIVE PAUSED COMPLETED ARCHIVED }
enum CampaignType        { EMAIL SOCIAL CONTENT SEO PAID MULTI_CHANNEL }
enum ContentType         { BLOG_POST EMAIL SOCIAL_MEDIA AD_COPY VIDEO_SCRIPT NEWSLETTER PRESS_RELEASE }
enum Platform            { LINKEDIN TWITTER INSTAGRAM FACEBOOK TIKTOK YOUTUBE EMAIL WEB }
enum SocialPlatform      { LINKEDIN INSTAGRAM FACEBOOK TWITTER TIKTOK YOUTUBE }
enum ContentStatus       { DRAFT REVIEW APPROVED PUBLISHED ARCHIVED }
enum PostStatus          { DRAFT SCHEDULED PUBLISHING PUBLISHED FAILED }
enum ContactStatus       { NEW CONTACTED QUALIFIED UNQUALIFIED CUSTOMER CHURNED }
enum DealStage           { LEAD QUALIFIED PROPOSAL NEGOTIATION CLOSED_WON CLOSED_LOST }
enum ActivityType        { NOTE CALL EMAIL MEETING TASK }
enum AutomationStatus    { ACTIVE INACTIVE DRAFT }
enum RunStatus           { SUCCESS FAILED RUNNING }
enum IntegrationProvider { HUBSPOT MAILCHIMP ZAPIER SLACK GOOGLE_ANALYTICS SALESFORCE NOTION }
enum IntegrationStatus   { CONNECTED DISCONNECTED ERROR }

═══════════════════════════════════════════════════════════════
PRICING PLANS (Implement exactly — Global USD pricing)
═══════════════════════════════════════════════════════════════

FREE (No credit card)
- AI Credits: 25/month
- Content pieces: 20
- Social accounts: 2
- Scheduled posts: 10
- Contacts (CRM): 250
- Campaigns: 2
- Automations: 1 (simple)
- Team members: 1
- Storage: 200MB
- Analytics: Basic (7 days)
- Integrations: None
- API access: No
- Support: Community

STARTER — $39/month or $390/year
- AI Credits: 200/month
- Content pieces: 200
- Social accounts: 5
- Scheduled posts: 100/month
- Contacts (CRM): 2,500
- Campaigns: 10
- Automations: 5
- Team members: 3
- Storage: 10GB
- Analytics: Standard (30 days)
- Integrations: Zapier, Slack
- API access: No
- Support: Email 48hr

GROWTH — $99/month or $990/year ← MOST POPULAR
- AI Credits: 1,000/month
- Content pieces: Unlimited
- Social accounts: 15
- Scheduled posts: Unlimited
- Contacts (CRM): 25,000
- Campaigns: Unlimited
- Automations: 25 (multi-step)
- Team members: 10
- Storage: 50GB
- Analytics: Advanced (90 days) + CSV export
- Custom branding: Yes
- Integrations: All standard (HubSpot, Mailchimp, GA, Slack, Zapier)
- API access: 5,000 req/month
- White-label reports: Yes
- Support: Priority email 24hr

BUSINESS — $249/month or $2,490/year
- AI Credits: 5,000/month
- Content pieces: Unlimited
- Social accounts: 50
- Scheduled posts: Unlimited
- Contacts (CRM): 100,000
- Campaigns: Unlimited
- Automations: Unlimited (advanced + AI-powered)
- Team members: 50
- Storage: 200GB
- Analytics: Full suite (1 year) + white-label dashboard
- Custom branding: Yes
- Integrations: All + custom webhooks + Salesforce
- API access: 50,000 req/month
- SSO/SAML: Yes
- Dedicated CSM: Yes
- Support: Slack channel 4hr response

ENTERPRISE — Custom (from $699/month)
- Everything in Business, unlimited
- Custom AI model fine-tuning on brand voice
- Dedicated infrastructure
- Custom SLA (99.9% uptime guarantee)
- On-premise deployment option
- Custom contract + invoicing
- 24/7 dedicated support team
- CTA: "Talk to Sales" → sales@zenia.ai

AI CREDIT ADD-ONS:
- 200 credits:  $15
- 1,000 credits: $59
- 5,000 credits: $199

═══════════════════════════════════════════════════════════════
FEATURES — ALL FULLY FUNCTIONAL
═══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
1. AUTH & ONBOARDING
──────────────────────────────────────────────────────────────
Auth:
- Email/password with email verification
- Google OAuth + LinkedIn OAuth
- Password reset via Resend email
- Protected routes via middleware.ts
- Session management via Supabase

Onboarding (5 steps, skippable):
Step 1: Workspace name, industry, website, logo upload
Step 2: Business type (B2B / B2C / Both), target market
Step 3: Primary use case (content / social / CRM / all)
Step 4: Connect first social account (optional)
Step 5: Choose plan + start free trial (or skip)

Store onboardingDone in User.
Redirect to /dashboard on completion.

──────────────────────────────────────────────────────────────
2. COMMAND CENTRE DASHBOARD
──────────────────────────────────────────────────────────────
Main dashboard showing:

Top row — KPI cards:
- AI Credits used/remaining (with progress bar)
- Total content pieces this month
- Active campaigns
- Scheduled posts (next 7 days)
- Total contacts
- Pipeline value (CRM deals)

Charts row:
- Area chart: AI credits usage (last 30 days)
- Bar chart: Content published by platform (last 30 days)
- Line chart: Contact growth over time
- Donut chart: Campaign status breakdown

Activity feed (right panel):
- Real-time log of: content generated, posts published,
  deals updated, automations triggered, team activity

Upcoming posts widget:
- Next 5 scheduled posts with platform icon + time

Quick action buttons:
- "Generate Content" → /content/generate
- "Schedule Post" → /social/compose
- "Add Contact" → /crm/contacts/new
- "New Campaign" → /campaigns/new
- "Ask Zenia" → /zenia-ai

Cmd+K command palette:
- Search all content, contacts, campaigns
- Quick actions from keyboard
- Recent items

──────────────────────────────────────────────────────────────
3. ZENIA AI AGENT (Core Feature)
──────────────────────────────────────────────────────────────
app/api/ai/agent/route.ts — Full AI agent with tool calling:

Use Vercel AI SDK streamText with tools. The agent can:

TOOLS THE AGENT HAS ACCESS TO:
- generateContent({ type, platform, topic, tone })
- scheduleSocialPost({ platform, caption, scheduledAt, accountId })
- createCampaign({ name, type, goal, audience, channels })
- addContact({ email, name, company, source })
- searchContacts({ query, filters })
- getCampaignAnalytics({ campaignId, dateRange })
- getSocialAnalytics({ platform, dateRange })
- createAutomation({ name, trigger, steps })
- searchContent({ query })
- getWorkspaceStats()

UI: components/ai/AgentChat.tsx
Full chat interface with:
- Message history with user/agent bubbles
- Streaming response with typewriter effect
- Tool execution cards (shows what agent is doing)
  e.g. "📝 Generating LinkedIn post..."
       "📅 Scheduling post for March 30..."
       "✅ Post scheduled successfully"
- Suggested prompts on empty state:
  "Write a LinkedIn post about [topic]"
  "Schedule 5 posts for this week"
  "Show me my campaign performance"
  "Add these contacts from CSV"
  "Create a campaign for our product launch"
- Attach files (images for social posts)
- Voice input button (Web Speech API)
- Clear conversation button
- Copy response button
- AI credits deduction: 1 per message

System prompt for Zenia agent:
You are Zenia, an AI marketing operating system.
You help marketing teams execute their entire marketing
strategy through natural conversation. You are proactive,
strategic, and action-oriented — you don't just advise,
you execute. When asked to do something, use your tools
to actually do it. Always confirm actions before executing
irreversible ones. Respond concisely and professionally.

──────────────────────────────────────────────────────────────
4. AI CONTENT GENERATOR
──────────────────────────────────────────────────────────────
app/api/ai/generate/route.ts:
- Stream text via Vercel AI SDK + Claude claude-sonnet-4-20250514
- Inputs: type, platform, topic, tone, audience,
          keywords, wordCount, brandVoice
- Content types:
  * Blog post (SEO-optimised, H2s, meta description, slug)
  * Email (subject + preview text + body + CTA)
  * LinkedIn post (professional, hooks, hashtags)
  * Instagram caption (emojis, hashtags, CTA)
  * Facebook post (conversational, engagement CTA)
  * Twitter/X thread (numbered tweets, hooks)
  * TikTok script (hook, content, CTA, trending sounds note)
  * YouTube description (SEO, chapters, links)
  * Ad copy (AIDA, headline variants, CTA)
  * Newsletter (sections, personalisation tokens)
  * Press release (AP style, boilerplate)
- Tone options: Professional, Casual, Witty, Bold,
                Empathetic, Authoritative, Storytelling
- AI credits: 1 per generation
- Auto-save to content library
- Version history (keep last 5 versions)

UI: Full-page generator with:
- Split view: inputs left, output right
- Real-time streaming with typewriter effect
- Platform selector with icons
- Tone slider
- Keywords chip input
- Copy / Save / Schedule buttons
- "Improve this" button (refine with AI, 1 credit)
- Character/word count with platform limits indicator

──────────────────────────────────────────────────────────────
5. CAMPAIGN MANAGER
──────────────────────────────────────────────────────────────
Campaign list page:
- Grid/list toggle view
- Filter by status, type, date, channel
- Campaign cards with: name, status badge, progress bar,
  channels icons, date range, quick stats

Campaign creation wizard (6 steps):
Step 1: Name, type, goal
Step 2: Target audience (persona builder)
Step 3: Channels + social accounts to use
Step 4: Budget + timeline
Step 5: AI generates full campaign brief (streaming)
        Includes: strategy, content calendar, KPIs,
        channel breakdown, suggested posting schedule
Step 6: Review + launch / save as draft

Campaign detail page:
- Campaign brief (editable with Tiptap)
- Content tab: all content pieces for this campaign
- Social posts tab: all scheduled/published posts
- Analytics tab: campaign performance metrics
- Status management (draft → active → paused → completed)

──────────────────────────────────────────────────────────────
6. SOCIAL MEDIA HUB
──────────────────────────────────────────────────────────────

Connected Accounts page:
- Connect LinkedIn, Instagram, Facebook, Twitter/X,
  TikTok, YouTube via OAuth
- Account cards: avatar, name, platform, follower count,
  last post, status
- Disconnect button with confirmation

Post Composer (/social/compose):
- Multi-platform selector (post to multiple at once)
- Rich text editor with emoji picker
- Media upload (images/videos with platform limits)
- Platform-specific previews (mobile-accurate):
  * LinkedIn: feed post preview
  * Instagram: grid + story preview
  * Twitter: tweet preview
  * Facebook: page post preview
  * TikTok: video post info preview
  * YouTube: description preview
- Character counter per platform (with red warning)
- First comment option (LinkedIn, Instagram)
- "Generate caption with AI" button (1 credit)
- Schedule options:
  * Post now
  * Schedule (date/time picker with timezone)
  * Add to queue (uses best time algorithm)
- Campaign attribution dropdown
- Save as draft

Content Calendar (/social/calendar):
- Full calendar view (month/week/day toggle)
- Drag and drop to reschedule posts
- Posts shown as platform-colored chips
- Click post to quick-edit
- Filter by platform, account, campaign, status
- "Add post" button on any day

Best time to post algorithm:
- Analyse workspace's historical engagement data
- If no data: use industry benchmarks per platform
- Show suggested times in composer

──────────────────────────────────────────────────────────────
7. CRM (Contact & Deal Management)
──────────────────────────────────────────────────────────────

Contacts:
- Table with: name, email, company, status, score, tags,
  last activity, created date
- TanStack Table with sorting, filtering, pagination
- Bulk actions: tag, assign status, export, delete
- Import via CSV (validate + deduplicate)
- Export to CSV
- Quick add contact form (slide-over panel)
- AI lead scoring (0-100 based on engagement + data completeness)

Contact detail page:
- Header: name, avatar initials, email, company, title
- Left: contact info + editable fields
- Right: activity timeline
- Tabs: Overview, Deals, Activities, Notes
- AI-powered outreach suggestions (1 credit):
  "Based on this contact's profile, here's a
   personalised outreach message..."
- Add activity: Note, Call, Email, Meeting, Task

Companies:
- Company list with domain, industry, size, contacts count
- Company detail: info + contacts + deals + activities

Deal Pipeline (Kanban):
- Columns: Lead → Qualified → Proposal →
           Negotiation → Closed Won → Closed Lost
- Drag cards between columns
- Deal card: title, company, value, contact, probability
- Click to expand deal detail (slide-over)
- Pipeline value total per column
- Filter by owner, company, value range, close date
- Win rate calculation
- Revenue forecast widget

──────────────────────────────────────────────────────────────
8. AUTOMATION ENGINE (Visual Workflow Builder)
──────────────────────────────────────────────────────────────

Workflow list:
- Name, status, trigger type, run count, last run, created
- Enable/disable toggle
- Duplicate workflow
- View logs

Workflow builder (/automation/[id]):
Visual node-based builder using @dnd-kit:
- Trigger node (what starts the workflow):
  * New contact added
  * Contact status changed
  * Deal stage changed
  * New social post published
  * Campaign launched
  * Schedule (cron: daily/weekly/monthly)
  * Webhook received
  * AI credit threshold reached
  * Form submitted

- Condition nodes (if/else branching):
  * Contact has tag X
  * Deal value > $X
  * Platform = LinkedIn

- Action nodes (what to do):
  * Send email (Resend)
  * Generate AI content
  * Schedule social post
  * Add/update contact
  * Create deal
  * Send Slack notification
  * Call webhook URL
  * Add tag to contact
  * Wait X hours/days

Each node: icon, label, config panel on click.
Connect nodes with arrows.
Save workflow as JSON in Automation.steps.

app/api/automation/trigger/route.ts:
- Receives trigger events
- Loads workflow from DB
- Executes steps sequentially
- Logs to AutomationLog
- Handles errors with retry logic

Pre-built workflow templates:
1. "Welcome new contact" — send welcome email
2. "Lead nurture sequence" — 3-email drip over 7 days
3. "Publish + notify" — post published → Slack alert
4. "Weekly content report" — every Monday, email report
5. "Deal won celebration" — deal closed → team Slack message

──────────────────────────────────────────────────────────────
9. ANALYTICS (Multi-layer)
──────────────────────────────────────────────────────────────

Overview dashboard:
- Date range picker (7d, 30d, 90d, 1y, custom)
- KPI cards with % change vs previous period
- All charts using Recharts

Content Analytics:
- Total content generated over time (line chart)
- Content by type (bar chart)
- Top performing content (table with engagement)
- AI credits consumption trend

Social Analytics:
- Followers growth per platform (multi-line chart)
- Engagement rate by platform (bar chart)
- Best performing posts (table)
- Optimal posting times heatmap
- Reach vs impressions (area chart)
- Platform breakdown (donut chart)

Campaign Analytics:
- Campaign performance table (impressions, clicks,
  conversions, CTR, ROAS, spend, revenue)
- Conversion funnel chart
- Revenue attribution by campaign
- Campaign comparison (select 2 campaigns side by side)

CRM Analytics:
- Contact growth over time
- Lead source breakdown (pie chart)
- Pipeline velocity (avg days per stage)
- Win rate by stage
- Deal value distribution
- Revenue forecast (next 30/60/90 days)

All analytics:
- Export to CSV (Growth+)
- Export to PDF report (Business+)
- White-label reports (Business+) — remove Zenia branding

──────────────────────────────────────────────────────────────
10. INTEGRATIONS
──────────────────────────────────────────────────────────────

Integration cards UI with status badges:

Standard integrations (Growth+):
- HubSpot — sync contacts + deals bidirectionally
- Mailchimp — sync contact lists + campaigns
- Google Analytics — pull website traffic data
- Slack — send workflow notifications
- Zapier — expose webhook for any automation
- Notion — save content to Notion pages

Business+ integrations:
- Salesforce — full CRM sync
- Custom webhooks — any URL trigger/receive

Each integration card:
- Provider logo + name + description
- "Connected" green badge or "Connect" button
- Configuration options (after connect)
- Last synced timestamp
- Disconnect option
- Plan gate overlay if not on correct plan

──────────────────────────────────────────────────────────────
11. BILLING (Full Stripe Implementation)
──────────────────────────────────────────────────────────────

app/api/webhooks/stripe/route.ts handles:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- customer.subscription.trial_ending (3 days before)

Billing page:
- Current plan card with all limits + usage bars
- "Upgrade" / "Change plan" buttons
- Monthly/yearly toggle (show annual savings)
- Invoice history (last 12 from Stripe)
- Update payment method → Stripe Customer Portal
- Cancel subscription (with exit survey modal)
- Buy extra AI credits section
- Next billing date + amount

Usage bars throughout app:
- AI credits (show at 80% warning)
- Storage
- Team seats
- Social accounts
- Contacts

Enforce limits:
- Before AI generation: check credits
- Before adding contact: check limit
- Before connecting social: check account limit
- Show upgrade modal with contextual message on limit hit

──────────────────────────────────────────────────────────────
12. TEAM MANAGEMENT
──────────────────────────────────────────────────────────────
- Invite by email (send invite via Resend)
- Pending invites list with resend/cancel
- Role assignment: Owner, Admin, Member, Viewer
- Permissions:
  Owner:  All access + billing + delete workspace
  Admin:  All access except billing + workspace deletion
  Member: Create/edit content, campaigns, CRM
  Viewer: Read-only everything
- Remove member with confirmation
- Seat usage bar (X of Y seats)
- Activity log per member

──────────────────────────────────────────────────────────────
13. SETTINGS
──────────────────────────────────────────────────────────────
Workspace settings:
- Name, slug, logo upload, website
- Industry, timezone
- Brand voice (text description used in AI prompts)
- Brand colors (used in white-label reports)
- Delete workspace (Owner only, type name to confirm)

Profile settings:
- Name, email, avatar upload
- Change password
- Delete account

Notification settings (toggle each):
- Weekly performance report (email)
- AI credits warning at 80%
- Team activity digest
- Automation failure alerts
- New contact added (from forms)
- Scheduled post published

API Keys (Growth+):
- Generate key (show once, copy prompt)
- Name, created, last used, usage count
- Revoke key
- API documentation link embedded

──────────────────────────────────────────────────────────────
14. MARKETING LANDING PAGE
──────────────────────────────────────────────────────────────

app/(marketing)/page.tsx

Hero:
- Headline: "The AI Marketing Operating System"
- Subheadline: "One platform to generate content, manage
  campaigns, schedule social posts, nurture leads, and
  automate your entire marketing — powered by AI agents
  that actually work."
- CTA 1: "Start for Free" → /signup
- CTA 2: "Watch Demo" → video modal
- Hero: Animated dashboard screenshot (CSS animation)
- Trust badges: "No credit card required" "Cancel anytime"
  "SOC2 ready"

Social proof:
- "Powering marketing teams worldwide"
- Animated counter: X content pieces generated,
  Y campaigns launched, Z hours saved
- Logo strip (placeholder)

Core features (6 cards with icons):
1. Zenia AI Agent — Your autonomous marketing assistant
2. AI Content Studio — Every content type, every platform
3. Social Media Hub — Schedule everywhere, analyse everything
4. Smart CRM — Contacts, deals, pipeline in one view
5. Workflow Automation — Set it, forget it, profit
6. Unified Analytics — One dashboard, all your data

How it works (3 steps with animation):
1. Connect your channels and tools
2. Let Zenia AI understand your brand and goals
3. Watch it execute your marketing automatically

Feature deep-dives (alternating image/text sections):
- Zenia AI Agent section
- Social scheduling section
- CRM pipeline section
- Automation builder section

Integrations showcase:
- Grid of integration logos
- "Connects with tools you already use"

Pricing section:
- Monthly/yearly toggle
- 4 plan cards (Free, Starter, Growth, Business)
- Enterprise CTA card
- Feature comparison table (collapsible)
- FAQ (8 questions)

Testimonials:
- 3 testimonial cards with avatar, name, role, company

Final CTA section:
- "Start your free plan today"
- "No credit card · Cancel anytime · Setup in 2 minutes"

Footer:
- Logo + tagline: "The AI Marketing Operating System"
- Columns: Product, Company, Resources, Legal
- Social links
- © 2025 Zenia. All rights reserved.

──────────────────────────────────────────────────────────────
15. EMAIL SYSTEM (Resend + React Email)
──────────────────────────────────────────────────────────────
WelcomeEmail.tsx — on signup
UpgradeEmail.tsx — on plan upgrade
InviteEmail.tsx — workspace invite with accept button
PaymentFailedEmail.tsx — dunning with update payment CTA
WeeklyReportEmail.tsx — every Monday:
  credits used, posts published, top content, pipeline value
TrialEndingEmail.tsx — 3 days before trial ends
CreditWarningEmail.tsx — at 80% credit usage
AutomationFailedEmail.tsx — when automation errors

All emails: Zenia branding, responsive, unsubscribe link.

═══════════════════════════════════════════════════════════════
SECURITY
═══════════════════════════════════════════════════════════════
- All API routes check Supabase session first
- Workspace isolation enforced on every DB query
- Zod validation on all inputs
- API keys: SHA-256 hashed, prefix shown in UI
- Stripe webhooks verified with signing secret
- Social tokens encrypted at rest (Supabase vault)
- Rate limiting via Upstash Redis:
  * Auth: 5 req/min per IP
  * AI routes: by plan tier
  * Public API: by API key tier
  * General: 120 req/min per user
- RLS enabled on all Supabase tables
- No secrets in client-side code ever

═══════════════════════════════════════════════════════════════
PLAN LIMITS (lib/plan-limits.ts)
═══════════════════════════════════════════════════════════════

export const PLAN_LIMITS = {
  FREE:       { credits:25,   content:20,   social:2,  scheduledPosts:10,  contacts:250,    campaigns:2,  automations:1,  seats:1,  storage:200    },
  STARTER:    { credits:200,  content:200,  social:5,  scheduledPosts:100, contacts:2500,   campaigns:10, automations:5,  seats:3,  storage:10000  },
  GROWTH:     { credits:1000, content:-1,   social:15, scheduledPosts:-1,  contacts:25000,  campaigns:-1, automations:25, seats:10, storage:50000  },
  BUSINESS:   { credits:5000, content:-1,   social:50, scheduledPosts:-1,  contacts:100000, campaigns:-1, automations:-1, seats:50, storage:200000 },
  ENTERPRISE: { credits:-1,   content:-1,   social:-1, scheduledPosts:-1,  contacts:-1,     campaigns:-1, automations:-1, seats:-1, storage:-1     },
}
// -1 = unlimited

<PlanGate minimumPlan="GROWTH" feature="custom branding">
  wraps any feature that requires upgrade
  shows modal with upgrade CTA if user below minimum plan
</PlanGate>

═══════════════════════════════════════════════════════════════
ENVIRONMENT VARIABLES
═══════════════════════════════════════════════════════════════

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_MONTHLY_PRICE_ID=
STRIPE_STARTER_YEARLY_PRICE_ID=
STRIPE_GROWTH_MONTHLY_PRICE_ID=
STRIPE_GROWTH_YEARLY_PRICE_ID=
STRIPE_BUSINESS_MONTHLY_PRICE_ID=
STRIPE_BUSINESS_YEARLY_PRICE_ID=
STRIPE_CREDITS_200_PRICE_ID=
STRIPE_CREDITS_1000_PRICE_ID=
STRIPE_CREDITS_5000_PRICE_ID=

# Anthropic
ANTHROPIC_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@zenia.ai

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Social OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Zenia
ENCRYPTION_KEY=                          ← 32-char key for token encryption

═══════════════════════════════════════════════════════════════
UI/UX DESIGN SYSTEM
═══════════════════════════════════════════════════════════════

Brand identity:
- Name: Zenia
- Tagline: "The AI Marketing Operating System"
- Personality: Intelligent, sleek, powerful, modern

<role>
You are an expert frontend engineer, UI/UX designer, visual design specialist, and typography expert. Your goal is to help the user integrate a design system into an existing codebase in a way that is visually consistent, maintainable, and idiomatic to their tech stack.

Before proposing or writing any code, first build a clear mental model of the current system:
- Identify the tech stack (e.g. React, Next.js, Vue, Tailwind, shadcn/ui, etc.).
- Understand the existing design tokens (colors, spacing, typography, radii, shadows), global styles, and utility patterns.
- Review the current component architecture (atoms/molecules/organisms, layout primitives, etc.) and naming conventions.
- Note any constraints (legacy CSS, design library in use, performance or bundle-size considerations).

Ask the user focused questions to understand the user's goals. Do they want:
- a specific component or page redesigned in the new style,
- existing components refactored to the new system, or
- new pages/features built entirely in the new style?

Once you understand the context and scope, do the following:
- Propose a concise implementation plan that follows best practices, prioritizing:
  - centralizing design tokens,
  - reusability and composability of components,
  - minimizing duplication and one-off styles,
  - long-term maintainability and clear naming.
- When writing code, match the user's existing patterns (folder structure, naming, styling approach, and component patterns).
- Explain your reasoning briefly as you go, so the user understand *why* you're making certain architectural or design choices.

Always aim to:
- Preserve or improve accessibility.
- Maintain visual consistency with the provided design system.
- Leave the codebase in a cleaner, more coherent state than you found it.
- Ensure layouts are responsive and usable across devices.
- Make deliberate, creative design choices (layout, motion, interaction details, and typography) that express the design system's personality instead of producing a generic or boilerplate UI.

</role>

<design-system>
# Bold Typography Design System

## Design Philosophy

Bold Typography is **poster design translated to web**. Typography isn't decoration—it's the entire visual language. Every design decision serves the type: color exists to create contrast, space exists to frame letterforms, and interaction exists to reveal typographic details.

### Core Principles

1. **Type as Hero**: Headlines aren't just labels—they're the visual centerpiece. A well-set 80pt headline is more compelling than any stock photo.

2. **Extreme Scale Contrast**: The gap between headline and body creates drama. Think 6:1 or greater ratio between H1 and paragraph text.

3. **Deliberate Negative Space**: White (or black) space isn't empty—it's the frame around your type. Generous margins make headlines feel intentional, not cramped.

4. **Strict Hierarchy**: Every element has a clear rank. No two elements compete for attention. The eye flows naturally: headline → subhead → body → action.

5. **Restrained Palette**: Black, white, and one accent. Maybe two. More colors dilute the typographic impact. Let the type shapes do the work.

### The Vibe

**Confident. Editorial. Deliberate.** This isn't friendly SaaS—it's a design manifesto. The page feels like a gallery exhibition or luxury magazine spread. Every word earns its place.

Visual signatures:
- Massive headlines that make you scroll
- Tight letter-spacing on display text (`-0.04em` to `-0.06em`)
- Wide letter-spacing on labels (`0.1em` to `0.2em`)
- Text that bleeds to edge on mobile
- Underlines as the primary interactive affordance
- No rounded corners—sharp edges match sharp typography

---

## Design Token System

### Colors (Dark Mode)

```
background:        #0A0A0A    // Near-black, not pure black
foreground:        #FAFAFA    // Warm white
muted:             #1A1A1A    // Subtle surface elevation
mutedForeground:   #737373    // Secondary text (WCAG AA on dark)
accent:            #FF3D00    // Vermillion—warm, urgent, visible
accentForeground:  #0A0A0A    // Dark text on accent
border:            #262626    // Barely-there dividers
input:             #1A1A1A    // Input backgrounds
card:              #0F0F0F    // Slight elevation from bg
cardForeground:    #FAFAFA
ring:              #FF3D00    // Focus states match accent
```

The accent is deliberate: vermillion/red-orange creates urgency and warmth against the cold dark background. It's used sparingly—headlines, key CTAs, and underlines only.

### Typography

**Primary Stack**: `"Inter Tight", "Inter", system-ui, sans-serif`
- Inter Tight for headlines (tighter default spacing)
- Clean, geometric, professional

**Display Stack**: `"Playfair Display", Georgia, serif`
- For pull quotes and testimonials only
- Creates elegant contrast with sans headlines

**Mono Stack**: `"JetBrains Mono", "Fira Code", monospace`
- Labels, stats, technical details

**Scale System**:
```
xs:    0.75rem    // 12px - fine print
sm:    0.875rem   // 14px - captions
base:  1rem       // 16px - body
lg:    1.125rem   // 18px - lead paragraphs
xl:    1.25rem    // 20px - subheads
2xl:   1.5rem     // 24px - section intros
3xl:   2rem       // 32px - H3
4xl:   2.5rem     // 40px - H2
5xl:   3.5rem     // 56px - H1 mobile
6xl:   4.5rem     // 72px - H1 tablet
7xl:   6rem       // 96px - H1 desktop
8xl:   8rem       // 128px - Hero statement
9xl:   10rem      // 160px - Decorative numbers
```

**Tracking**:
```
tighter:  -0.06em   // Display headlines
tight:    -0.04em   // Large headings
normal:   -0.01em   // Body (slightly tightened)
wide:     0.05em    // Small labels
wider:    0.1em     // All-caps labels
widest:   0.2em     // Sparse emphasis
```

**Line Heights**:
```
none:     1         // Single-line headlines
tight:    1.1       // Multi-line headlines
snug:     1.25      // Subheads
normal:   1.6       // Body text
relaxed:  1.75      // Long-form reading
```

### Radius & Border

```
radius:   0px       // No border-radius anywhere. Sharp edges only.
border:   1px       // Thin, precise dividers
borderThick: 2px    // Accent underlines
```

### Shadows & Effects

No traditional shadows. Depth comes from:
- **Layered type**: Large muted text behind smaller bright text
- **Underlines**: 2-3px accent lines under interactive elements
- **Dividers**: Full-width horizontal rules

```
shadow: none
textShadow: none
```

### Textures & Patterns

**Subtle noise grain texture**: A very subtle fractal noise pattern at 1.5% opacity overlays the entire page, adding tactile quality to the dark background without being obtrusive. Implemented via inline SVG data URL with feTurbulence filter.

**Typographic layering for depth**:
- Decorative oversized numbers/text behind content with low opacity
- Text shadow technique: duplicate text offset 1-2px in border color creates depth without traditional shadows
- Accent bars: thin horizontal accent-colored bars (h-1, w-16) as visual anchors on key elements

---

## Component Stylings

### Buttons

Primary button is **text-only with animated underline**:
```
- No background fill
- Text in accent color
- Animated underline: absolute positioned span, h-0.5, bg-accent
- Base state: scale-x-100, on hover: scale-x-110
- Uppercase, wide tracking (tracking-wider: 0.1em)
- Font-weight: 600 (semibold)
- Padding: py-2/3/4 based on size (sm/default/lg), px-0
- Gap between children: gap-2/2.5/3
- Active state: translate-y-px for press feedback
- Transition: 150ms all
```

Secondary/outline button:
```
- Border: 1px solid foreground
- Text: foreground
- No background fill initially
- On hover: bg-foreground, text becomes background color (full inversion)
- Sharp corners (0px radius)
- Padding: px-6 (needs horizontal padding unlike primary)
- Uppercase, tracking-wider
```

Ghost button:
```
- No border, no fill
- Text: mutedForeground
- Padding: px-4
- On hover: text becomes foreground
- Underline appears via scale-x-0 to scale-x-100 transition
- Underline is h-px (thinner than primary)
```

All buttons:
```
- Focus-visible: 2px ring in accent, 2px offset
- Disabled: pointer-events-none, opacity-50
- Inline-flex for proper alignment
- Whitespace-nowrap to prevent wrapping
```

### Cards/Containers

**Minimal card usage.** Content is primarily separated by:
- Generous section padding (py-20 to py-40)
- Full-width horizontal borders (border-t/border-b)
- Typography scale changes
- Background color alternation (background ↔ muted)

When a "card" is necessary (pricing, testimonials):
```
- Border: 1px solid border (controlled by `bordered` prop)
- Background: transparent (bg-transparent)
- No radius (0px, sharp corners)
- No shadow
- Padding: p-6 (mobile) to p-8 (desktop)
- Transition on hover: border-hover color (150ms)
```

Highlighted cards (featured pricing tier):
```
- Border: 2px solid accent (overrides default 1px)
- Small accent badge above content (bg-accent, px-3 py-1, uppercase mono text)
- No background change, border is the differentiator
```

### Inputs

```
- Background: input color (#1A1A1A)
- Border: 1px solid border
- Border-radius: 0px (rounded-none, sharp corners)
- Height: h-12 (mobile) to h-14 (desktop), responsive
- Font-size: text-base (16px, prevents zoom on iOS)
- Padding: px-4
- Text color: foreground
- Placeholder: mutedForeground
- Focus: border-accent, no ring, no glow, outline-none
- Transition: colors 150ms
- Disabled: cursor-not-allowed, opacity-50
```

---

## Layout Strategy

### Container
```
maxWidth: 1200px (max-w-5xl)
padding: 24px mobile, 48px tablet, 64px desktop
```

### Section Spacing
```
py-20 (80px) - tight sections
py-28 (112px) - standard sections
py-40 (160px) - hero/CTA sections
```

### Grid Philosophy
- **Asymmetric grids**: 7/5 or 8/4 splits instead of 6/6
- **Staggered alignment**: Elements don't always align top
- **Text columns**: max-w-2xl for readability, but headlines can span full width

---

## Effects & Animation

### Motion Philosophy
**Fast and decisive.** No bouncy easing. No playful delays. Movement is confident and direct.

```
duration: 150ms - micro-interactions (buttons, underlines)
duration: 200ms - standard transitions (FAQ accordion, colors)
duration: 500ms - image hover effects
easing: cubic-bezier(0.25, 0, 0, 1) - fast-out, crisp stop
```

### Specific Effects

**Link/Button interactions**:
- Underline scale animation (scale-x-0 to scale-x-100 on hover for ghost, scale-x-100 to scale-x-110 for primary)
- Text color transition (150ms)
- Active press feedback: translate-y-px for tactile response
- No scale, no glow, no bounce

**Card hover**:
- Border color lightens (border-hover token)
- Background color change on feature cards (transparent → muted)
- No lift, no shadow, no scale

**Page scroll animations** (Framer Motion):
- Fade in + slide up (opacity 0→1, translateY 20px→0) over 500ms
- Stagger children by 80ms with 100ms delay before first
- Viewport trigger: once only, 15% threshold, -50px margin

**FAQ accordion**:
- Height auto-animate with opacity fade
- 200ms duration with ease-out
- Icons swap (Plus ↔ Minus) instantly

---

## Iconography

From `lucide-react`:
```
- Stroke width: 1.5px (thinner than default 2px for elegance)
- Sizes by context:
  - 16px: inline with small text (arrows in buttons)
  - 18px: FAQ toggle, footer social icons
  - 20px: standard navbar icons
  - 24px: feature section icons (28px on desktop)
- Color: currentColor (inherits from parent text color)
- Style: Use sparingly—text labels are preferred
- Never use filled icons, always outline/stroke style
```

---

## Responsive Strategy

**Mobile-first typography scaling**:
- Headlines: text-3xl (mobile) → text-4xl/5xl (tablet) → text-6xl/7xl/8xl (desktop)
- Body text: text-base (16px) throughout with md:text-lg on key sections
- Maintain hierarchy ratio at all sizes

**Layout shifts**:
- Stats: 1 column → 2 columns (sm) → 4 columns (md)
- Features: 1 column → 2 columns (sm) → 3 columns (lg)
- Pricing: 1 column → 2 columns (sm) → 3 columns (lg)
- Footer: 2 columns → 4 columns (md) → 5 columns (lg)

**Spacing adjustments**:
- Section padding: py-20 (mobile) → py-28 (md) → py-32/40 (lg)
- Container padding: px-6 (mobile) → px-12 (md) → px-16 (lg)

**Mobile-specific fixes**:
- Ensure touch targets are minimum 44x44px (buttons h-12 on mobile, h-14 on desktop)
- Stack email input + button on mobile, side-by-side on tablet+

---

## Accessibility

**Contrast**:
- foreground (#FAFAFA) on background (#0A0A0A) = 18.1:1 ✓
- mutedForeground (#737373) on background = 5.3:1 ✓ (AA)
- accent (#FF3D00) on background = 5.4:1 ✓ (AA for large text)

**Focus states**:
- 2px accent outline
- 2px offset from element
- Visible on all interactive elements

**Typography**:
- Body text minimum 16px
- Line-height minimum 1.5 for body
- No thin weights below 400

**Interaction**:
- Touch targets minimum 44x44px
- Underlines are 2px+ for visibility
- Color is never the only indicator
</design-system>

Dark mode default with light mode toggle.

Dashboard layout:
- Left sidebar: 260px, collapsible to 60px icon-only mode
- Top of sidebar: Zenia logo + workspace switcher
- Bottom of sidebar: AI credits bar + plan badge + user avatar
- Main content: scrollable, max-width 1400px centered
- Header: breadcrumb (left) + search + notifications + user (right)
- Right panel: context drawer for detail views (slide in)

Sidebar navigation groups:
  WORKSPACE
  - Command Centre (dashboard)
  - Zenia AI ← highlighted with gradient

  MARKETING
  - Content Studio
  - Campaigns
  - Social Media Hub

  GROWTH
  - CRM
  - Automation

  INSIGHTS
  - Analytics

  SETTINGS
  - Integrations
  - Team
  - Settings

All pages require:
- Loading skeletons (Tailwind animate-pulse)
- Empty states with illustration + CTA
- Error boundaries with retry
- Toast notifications (sonner)
- Confirm modals for destructive actions
- Keyboard shortcuts documented in Cmd+K

Animations:
- Page transitions: subtle fade + translate (Framer Motion)
- Sidebar collapse: smooth width transition
- Streaming text: typewriter cursor effect
- Agent tool execution: animated loading card
- Charts: animate on mount (Recharts built-in)
- Hover states: subtle scale + shadow on cards
- Modal: scale + fade enter/exit

Mobile responsive:
- Sidebar → bottom navigation bar on mobile
- Tables → card list on mobile
- Composer → full-screen modal on mobile
- Calendar → agenda view on mobile

═══════════════════════════════════════════════════════════════
POSTHOG EVENTS TO TRACK
═══════════════════════════════════════════════════════════════
signup, login, onboarding_completed, plan_upgraded,
plan_downgraded, content_generated, campaign_created,
social_post_scheduled, social_post_published,
contact_added, deal_created, deal_won,
automation_created, automation_triggered,
integration_connected, ai_agent_message,
api_key_created, invite_sent, workspace_created

═══════════════════════════════════════════════════════════════
ADDITIONAL REQUIREMENTS
═══════════════════════════════════════════════════════════════
1. TypeScript strict mode — zero any types
2. Every server action wrapped in try/catch with typed errors
3. Optimistic updates for all mutations (TanStack Query)
4. Proper React Suspense boundaries + streaming
5. SEO metadata on all marketing pages
6. robots.txt + sitemap.xml generated dynamically
7. Prettier + ESLint configured
8. All monetary values stored in cents
9. All dates stored as UTC
10. Stripe Customer Portal for self-serve billing
11. Console.log only in development
12. All forms: disable submit while loading, re-enable on error
13. Images: next/image with proper sizing
14. Fonts: next/font for performance
15. Bundle: analyse with @next/bundle-analyzer
16. Social tokens encrypted before storing in DB
17. API responses always typed (never `any`)
18. README.md with full setup + deployment guide

═══════════════════════════════════════════════════════════════
BUILD ORDER
═══════════════════════════════════════════════════════════════

Generate in this exact order:

1.  package.json (all dependencies)
2.  prisma/schema.prisma
3.  middleware.ts
4.  lib/ (all utilities, clients, plans)
5.  types/index.ts
6.  app/(auth)/ pages
7.  app/(dashboard)/layout.tsx
8.  components/dashboard/ (Sidebar, Header, CommandPalette)
9.  app/(dashboard)/dashboard/page.tsx
10. app/api/ai/ routes (agent first, then generate)
11. components/ai/ (AgentChat, ContentGenerator)
12. app/(dashboard)/content/ pages
13. app/(dashboard)/campaigns/ pages
14. app/api/social/ routes
15. components/social/ (Composer, Calendar)
16. app/(dashboard)/social/ pages
17. app/(dashboard)/crm/ pages
18. app/(dashboard)/automation/ pages
19. app/(dashboard)/analytics/ pages
20. app/api/webhooks/ (stripe, qstash)
21. Billing pages + components
22. Team + Settings pages
23. Integrations page
24. Email templates (Resend)
25. app/(marketing)/ (landing + pricing)
26. API v1 public routes
27. robots.txt + sitemap.xml

Every file must be complete and production-ready.
No "// TODO" or "// implement later" comments.
No placeholder functions.
Every feature must actually work end-to-end.