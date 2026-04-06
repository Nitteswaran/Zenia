🚀 Zenia — The AI Marketing Operating System

Zenia is not a tool. It’s an operating system for marketing.

One platform where:

AI agents execute tasks autonomously
workflows run end-to-end
every marketing function lives in one unified dashboard

Think HubSpot + Zapier + Hootsuite + GPT — combined into one system.

🧠 Core Philosophy
One dashboard replaces all marketing tools
AI agents don’t assist — they execute
Everything connects and orchestrates together
Automation is first-class, not an add-on
Built for global scale (solo → enterprise)
⚡ Key Features
🤖 Zenia AI Agent (Core)
Autonomous AI that performs actions using tools
Multi-step reasoning + execution
Can:
Generate content
Schedule posts
Create campaigns
Add contacts
Analyse performance
Real-time streaming responses + task execution UI
✍️ AI Content Studio
Generate:
Blog posts (SEO optimized)
Social content (LinkedIn, IG, X, TikTok, etc.)
Emails, newsletters, ad copy
Tone control + keyword targeting
Version history + refinement
Auto-save to content library
📢 Social Media Hub
Multi-platform publishing (LinkedIn, IG, TikTok, etc.)
Visual content calendar (drag & drop)
Best-time-to-post algorithm
Platform-specific previews
Scheduling via QStash
📊 Campaign Manager
Campaign wizard with AI-generated strategy
Multi-channel orchestration
Budget + timeline tracking
Built-in analytics (CTR, ROAS, conversions)
🧩 CRM (Contacts + Deals)
Contact management with scoring
Deal pipeline (Kanban)
Activity tracking + timeline
AI-powered outreach suggestions
⚙️ Automation Engine
Visual workflow builder
Triggers → Conditions → Actions
Examples:
New lead → send email
Deal won → notify team
Weekly report → auto email
Full execution engine with logs
📈 Unified Analytics
Content, social, CRM, and campaign analytics
Real-time dashboards
Export to CSV / PDF
White-label reports (paid plans)
🔌 Integrations
HubSpot, Mailchimp, Slack, GA, Notion
Zapier + Webhooks
Salesforce (Business+)
💳 Billing & Usage
Stripe subscriptions + usage-based AI credits
Plan enforcement across the system
Upgrade flows + customer portal
🏗 Tech Stack
Layer	Technology
Framework	Next.js 15 (App Router, TypeScript strict)
UI	Tailwind CSS v4 + shadcn/ui
Database	Supabase (PostgreSQL) + Prisma
Auth	Supabase Auth (OAuth + email)
AI	Vercel AI SDK + Claude Sonnet
State	Zustand + TanStack Query
Storage	Supabase Storage
Email	Resend + React Email
Payments	Stripe
Analytics	PostHog
Queue	Upstash QStash
Rate Limit	Upstash Redis
Deployment	Vercel
📁 Project Structure
zenia/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (marketing)/
│   └── api/
├── components/
├── lib/
├── prisma/
├── types/
└── middleware.ts
⚙️ Environment Variables

Create .env:

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# AI
ANTHROPIC_API_KEY=

# Email
RESEND_API_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=
🚀 Getting Started
# Clone repo
git clone https://github.com/your-username/zenia.git

cd zenia

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Run dev server
npm run dev
🔐 Security
Supabase Row-Level Security (RLS)
API key hashing (SHA-256)
Encrypted OAuth tokens
Rate limiting (Upstash Redis)
Stripe webhook verification
Full workspace isolation
💰 Pricing
Plan	Price	Target
Free	$0	Individuals
Starter	$39/mo	Small teams
Growth	$99/mo	Scaling teams
Business	$249/mo	Large teams
Enterprise	Custom	Corporations

AI credits are usage-based and enforced globally.

📊 Architecture Highlights
AI-first system design
Event-driven automation engine
Multi-tenant workspace architecture
Tool-based AI execution (not just chat)
Strict type safety (TypeScript + Zod)
🧪 Development Standards
TypeScript strict mode (no any)
Fully typed API responses
Zod validation everywhere
Optimistic UI updates
Error boundaries + loading states
No client-side secrets
📦 Deployment

Deploy instantly with Vercel:

vercel

Required:

Set all environment variables
Connect Supabase
Configure Stripe webhooks
Add OAuth credentials
📈 Vision

Zenia aims to become:

The operating system layer for marketing.

Not another tool — but the platform every marketing workflow runs on.

🤝 Contributing

We welcome contributions:

git checkout -b feature/your-feature
git commit -m "Add feature"
git push origin feature/your-feature

Open a PR.

📬 Contact
Email: spnittes@gmail.com
Issues: GitHub Issues
🧠 Final Note

Zenia is designed to replace:

CRM tools
Social schedulers
Automation tools
Content generators
Analytics dashboards

All with one unified AI system.
