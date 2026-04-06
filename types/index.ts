// Re-export Prisma types
export type {
  User,
  Workspace,
  WorkspaceMember,
  Campaign,
  Content,
  SocialAccount,
  SocialPost,
  Contact,
  Company,
  Deal,
  Activity,
  Automation,
  AutomationLog,
  Integration,
  CampaignAnalytics,
  ApiKey,
  Notification,
  Segment,
  CrmInsight,
} from '@prisma/client'

export {
  Role,
  WorkspaceRole,
  Plan,
  CampaignStatus,
  CampaignType,
  ContentType,
  Platform,
  SocialPlatform,
  ContentStatus,
  PostStatus,
  ContactStatus,
  DealStage,
  ActivityType,
  AutomationStatus,
  RunStatus,
  IntegrationProvider,
  IntegrationStatus,
} from '@prisma/client'

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  details?: Record<string, unknown>
}

// =============================================================================
// Plan & Billing Types
// =============================================================================

export type PlanName = 'FREE' | 'STARTER' | 'GROWTH' | 'BUSINESS' | 'ENTERPRISE'

export interface PlanLimit {
  credits: number
  content: number
  social: number
  scheduledPosts: number
  contacts: number
  campaigns: number
  automations: number
  seats: number
  storage: number
}

export interface PlanFeature {
  name: string
  included: boolean
  limit?: number | string
}

export interface PlanDetails {
  name: PlanName
  displayName: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
  limits: PlanLimit
  highlighted?: boolean
}

export interface BillingInfo {
  plan: PlanName
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
}

// =============================================================================
// Workspace Context Types
// =============================================================================

export interface WorkspaceContext {
  id: string
  name: string
  slug: string
  logoUrl?: string | null
  plan: PlanName
  aiCreditsUsed: number
  aiCreditsLimit: number
  timezone: string
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
}

// WorkspaceRole is re-exported from @prisma/client above

export interface UserContext {
  id: string
  email: string
  name?: string | null
  avatarUrl?: string | null
  role: string
  preferredLocale: string
  onboardingDone: boolean
}

// =============================================================================
// Navigation Types
// =============================================================================

export interface NavItem {
  title: string
  href: string
  icon?: string
  badge?: string | number
  disabled?: boolean
  external?: boolean
  children?: NavItem[]
}

export interface NavGroup {
  title?: string
  items: NavItem[]
}

export interface BreadcrumbItem {
  title: string
  href?: string
}

// =============================================================================
// Form Types
// =============================================================================

export interface LoginFormData {
  email: string
  password: string
  remember?: boolean
}

export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export interface WorkspaceFormData {
  name: string
  slug: string
  website?: string
  industry?: string
  timezone?: string
}

export interface OnboardingStep1Data {
  workspaceName: string
  slug: string
  industry: string
  website?: string
}

export interface OnboardingStep2Data {
  goal: string
  teamSize: string
  channels: string[]
}

export interface OnboardingStep3Data {
  socialAccounts: {
    platform: string
    connected: boolean
  }[]
}

export interface OnboardingStep4Data {
  targetAudience: string
  brandVoice: string
  competitors?: string
}

export interface OnboardingStep5Data {
  plan: PlanName
}

export interface ContactFormData {
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  title?: string
  source?: string
  status?: string
  companyId?: string
  tags?: string[]
  notes?: string
}

export interface CompanyFormData {
  name: string
  domain?: string
  industry?: string
  size?: string
  website?: string
  notes?: string
}

export interface DealFormData {
  title: string
  value: number
  currency: string
  stage: string
  probability: number
  closeDate?: Date
  contactId?: string
  companyId?: string
  notes?: string
}

export interface CampaignFormData {
  name: string
  description?: string
  type: string
  goal?: string
  startDate?: Date
  endDate?: Date
  budget?: number
  channels: string[]
  targetAudience?: Record<string, unknown>
}

export interface ContentGenerateFormData {
  type: string
  platform?: string
  topic: string
  tone: string
  audience?: string
  keywords?: string[]
  language: string
  length?: string
  additionalContext?: string
}

export interface SocialPostFormData {
  caption: string
  platform: string
  socialAccountId?: string
  scheduledAt?: Date
  mediaUrls?: string[]
  campaignId?: string
}

export interface AutomationFormData {
  name: string
  description?: string
  trigger: AutomationTrigger
  steps: AutomationStep[]
}

export interface ApiKeyFormData {
  name: string
}

export interface ProfileFormData {
  name: string
  email: string
  avatarUrl?: string
  preferredLocale?: string
}

// =============================================================================
// AI & Agent Types
// =============================================================================

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface AIGenerationRequest {
  type: string
  topic: string
  tone: string
  audience?: string
  keywords?: string[]
  language: string
  length?: string
  context?: string
  workspaceId: string
}

export interface AIGenerationResult {
  content: string
  title?: string
  metadata?: Record<string, unknown>
  tokensUsed: number
}

export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface AgentAction {
  tool: string
  parameters: Record<string, unknown>
  result?: unknown
  error?: string
}

// =============================================================================
// Automation Types
// =============================================================================

export type TriggerType =
  | 'contact_created'
  | 'deal_stage_changed'
  | 'form_submitted'
  | 'tag_added'
  | 'scheduled'
  | 'campaign_started'
  | 'content_published'
  | 'lead_score_threshold'
  | 'crm_inactivity'

export type StepType =
  | 'send_email'
  | 'generate_content'
  | 'schedule_post'
  | 'add_contact'
  | 'create_deal'
  | 'send_slack'
  | 'webhook'
  | 'add_tag'
  | 'wait'

export interface AutomationTrigger {
  type: TriggerType
  config?: Record<string, unknown>
}

export interface AutomationStep {
  id: string
  type: StepType
  name: string
  config: Record<string, unknown>
  nextStepId?: string
  conditions?: AutomationCondition[]
}

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: unknown
}

export interface AutomationRunContext {
  workspaceId: string
  automationId: string
  triggerData: Record<string, unknown>
  contactId?: string
  dealId?: string
}

// =============================================================================
// Analytics Types
// =============================================================================

export interface AnalyticsMetric {
  label: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface SocialMetrics {
  platform: string
  followers: number
  engagement: number
  reach: number
  impressions: number
  posts: number
}

export interface CampaignMetrics {
  impressions: number
  clicks: number
  conversions: number
  spend: number
  revenue: number
  ctr: number
  roas: number
}

// =============================================================================
// Table & Filter Types
// =============================================================================

export interface TableFilter {
  column: string
  operator: string
  value: unknown
}

export interface TableSort {
  column: string
  direction: 'asc' | 'desc'
}

export interface TablePagination {
  page: number
  pageSize: number
}

export interface TableState {
  filters: TableFilter[]
  sort?: TableSort
  pagination: TablePagination
  search?: string
}

// =============================================================================
// Upload Types
// =============================================================================

export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
}

// =============================================================================
// Notification Types
// =============================================================================

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'campaign'
  | 'automation'
  | 'billing'
  | 'team'

// =============================================================================
// CRM AI Types
// =============================================================================

export type SegmentOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'gte'
  | 'lte'
  | 'within_days'   // lastInteractionAt within last N days
  | 'older_than_days' // lastInteractionAt older than N days

export interface SegmentCondition {
  field: 'status' | 'score' | 'tags' | 'source' | 'lifecycleStage' | 'lastInteractionAt' | 'createdAt' | 'title' | 'companyId'
  operator: SegmentOperator
  value: string | number | string[]
}

export interface SegmentFilters {
  conditions: SegmentCondition[]
  logic: 'AND' | 'OR'
}

export type ScoreLabel = 'cold' | 'warm' | 'hot'

export interface LeadScoreResult {
  contactId: string
  score: number
  label: ScoreLabel
  breakdown: {
    profileCompleteness: number
    statusScore: number
    dealActivity: number
    activityRecency: number
    tagBonus: number
  }
}

export interface SalesAssistantSuggestion {
  action: string           // e.g. "Send follow-up email"
  rationale: string        // why this action
  priority: 'high' | 'medium' | 'low'
  suggestedMessage?: string
}

export interface CrmInsightData {
  id: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  generatedAt: string
}

export interface NotificationData {
  id: string
  title: string
  body: string
  type: NotificationType
  read: boolean
  metadata?: Record<string, unknown>
  createdAt: Date
}
