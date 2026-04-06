import { z } from 'zod'

// =============================================================================
// Auth Schemas
// =============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional().default(false),
})

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// =============================================================================
// Workspace Schemas
// =============================================================================

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  industry: z.string().optional(),
  timezone: z.string().optional().default('UTC'),
})

// =============================================================================
// Onboarding Schemas
// =============================================================================

export const onboardingStep1Schema = z.object({
  workspaceName: z
    .string()
    .min(1, 'Workspace name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  industry: z.string().min(1, 'Please select your industry'),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
})

export const onboardingStep2Schema = z.object({
  goal: z.string().min(1, 'Please select your primary goal'),
  teamSize: z.string().min(1, 'Please select your team size'),
  channels: z
    .array(z.string())
    .min(1, 'Please select at least one channel'),
})

export const onboardingStep3Schema = z.object({
  socialAccounts: z.array(
    z.object({
      platform: z.string(),
      connected: z.boolean(),
    })
  ),
})

export const onboardingStep4Schema = z.object({
  targetAudience: z
    .string()
    .min(1, 'Please describe your target audience')
    .max(500, 'Description must be less than 500 characters'),
  brandVoice: z.string().min(1, 'Please select your brand voice'),
  competitors: z.string().max(500, 'Must be less than 500 characters').optional(),
})

export const onboardingStep5Schema = z.object({
  plan: z.enum(['FREE', 'STARTER', 'GROWTH', 'BUSINESS', 'ENTERPRISE']),
})

// =============================================================================
// CRM Schemas
// =============================================================================

export const contactSchema = z.object({
  firstName: z.string().max(100).optional().or(z.literal('')),
  lastName: z.string().max(100).optional().or(z.literal('')),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z.string().max(50).optional().or(z.literal('')),
  title: z.string().max(200).optional().or(z.literal('')),
  source: z.string().optional(),
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CUSTOMER', 'CHURNED'])
    .optional()
    .default('NEW'),
  companyId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

export const companySchema = z.object({
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Name must be less than 200 characters'),
  domain: z.string().max(200).optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

export const segmentConditionSchema = z.object({
  field: z.enum(['status', 'score', 'tags', 'source', 'lifecycleStage', 'lastInteractionAt', 'createdAt', 'title', 'companyId']),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'in', 'not_in', 'gte', 'lte', 'within_days', 'older_than_days']),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
})

export const segmentFiltersSchema = z.object({
  conditions: z.array(segmentConditionSchema).min(1, 'Add at least one condition'),
  logic: z.enum(['AND', 'OR']).default('AND'),
})

export const segmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  filters: segmentFiltersSchema,
})

export const dealSchema = z.object({
  title: z
    .string()
    .min(1, 'Deal title is required')
    .max(200, 'Title must be less than 200 characters'),
  value: z
    .number()
    .min(0, 'Value must be a positive number')
    .default(0),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  stage: z
    .enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'])
    .default('LEAD'),
  probability: z
    .number()
    .min(0, 'Probability must be between 0 and 100')
    .max(100, 'Probability must be between 0 and 100')
    .default(0),
  closeDate: z.date().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

// =============================================================================
// Campaign Schema
// =============================================================================

export const campaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000).optional().or(z.literal('')),
  type: z.enum(['EMAIL', 'SOCIAL', 'CONTENT', 'SEO', 'PAID', 'MULTI_CHANNEL']),
  goal: z.string().max(500).optional().or(z.literal('')),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.number().min(0).optional(),
  channels: z.array(z.string()).default([]),
  targetAudience: z.record(z.unknown()).optional(),
})

// =============================================================================
// Content Schemas
// =============================================================================

export const contentGenerateSchema = z.object({
  type: z.enum([
    'BLOG_POST',
    'EMAIL',
    'SOCIAL_MEDIA',
    'AD_COPY',
    'VIDEO_SCRIPT',
    'NEWSLETTER',
    'PRESS_RELEASE',
    'CAMPAIGN_BRIEF',
  ]),
  platform: z
    .enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE', 'EMAIL', 'WEB'])
    .optional(),
  topic: z
    .string()
    .min(1, 'Topic is required')
    .max(500, 'Topic must be less than 500 characters'),
  tone: z.string().min(1, 'Tone is required'),
  audience: z.string().max(500).optional(),
  keywords: z.array(z.string()).optional().default([]),
  language: z.string().default('en'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  additionalContext: z.string().max(1000).optional().or(z.literal('')),
})

// =============================================================================
// Social Post Schema
// =============================================================================

export const socialPostSchema = z.object({
  caption: z
    .string()
    .min(1, 'Caption is required')
    .max(5000, 'Caption must be less than 5000 characters'),
  platform: z.enum(['LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'TIKTOK', 'YOUTUBE']),
  socialAccountId: z.string().optional(),
  scheduledAt: z.date().optional(),
  mediaUrls: z.array(z.string().url()).optional().default([]),
  campaignId: z.string().optional(),
})

// =============================================================================
// Automation Schema
// =============================================================================

export const automationTriggerSchema = z.object({
  type: z.enum([
    'contact_created',
    'deal_stage_changed',
    'form_submitted',
    'tag_added',
    'scheduled',
    'campaign_started',
    'content_published',
    'lead_score_threshold',
    'crm_inactivity',
  ]),
  config: z.record(z.unknown()).optional(),
})

export const automationStepSchema = z.object({
  id: z.string(),
  type: z.enum([
    'send_email',
    'generate_content',
    'schedule_post',
    'add_contact',
    'create_deal',
    'send_slack',
    'webhook',
    'add_tag',
    'wait',
  ]),
  name: z.string().min(1, 'Step name is required'),
  config: z.record(z.unknown()),
  nextStepId: z.string().optional(),
  conditions: z
    .array(
      z.object({
        field: z.string(),
        operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
        value: z.unknown(),
      })
    )
    .optional(),
})

export const automationSchema = z.object({
  name: z
    .string()
    .min(1, 'Automation name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z.string().max(500).optional().or(z.literal('')),
  trigger: automationTriggerSchema,
  steps: z.array(automationStepSchema).min(1, 'At least one step is required'),
})

// =============================================================================
// API Key Schema
// =============================================================================

export const apiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .max(100, 'Name must be less than 100 characters'),
})

// =============================================================================
// Profile Schema
// =============================================================================

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  avatarUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  preferredLocale: z
    .enum(['en', 'ms', 'zh', 'ar', 'es', 'fr'])
    .optional()
    .default('en'),
})

// =============================================================================
// Invite Team Member Schema
// =============================================================================

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
})

// =============================================================================
// Type Exports
// =============================================================================

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type WorkspaceFormData = z.infer<typeof workspaceSchema>
export type OnboardingStep1Data = z.infer<typeof onboardingStep1Schema>
export type OnboardingStep2Data = z.infer<typeof onboardingStep2Schema>
export type OnboardingStep3Data = z.infer<typeof onboardingStep3Schema>
export type OnboardingStep4Data = z.infer<typeof onboardingStep4Schema>
export type OnboardingStep5Data = z.infer<typeof onboardingStep5Schema>
export type SegmentFormData = z.infer<typeof segmentSchema>
export type SegmentFiltersData = z.infer<typeof segmentFiltersSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type CompanyFormData = z.infer<typeof companySchema>
export type DealFormData = z.infer<typeof dealSchema>
export type CampaignFormData = z.infer<typeof campaignSchema>
export type ContentGenerateFormData = z.infer<typeof contentGenerateSchema>
export type SocialPostFormData = z.infer<typeof socialPostSchema>
export type AutomationFormData = z.infer<typeof automationSchema>
export type ApiKeyFormData = z.infer<typeof apiKeySchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>
