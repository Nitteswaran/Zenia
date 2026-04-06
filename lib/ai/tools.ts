import { tool } from 'ai'
import { z } from 'zod'

export const agentTools = {
  generateContent: tool({
    description:
      'Generate marketing content (blog posts, social media captions, email copy, ad copy, etc.) based on specified parameters. Use this when the user asks to create, write, or generate any type of content.',
    parameters: z.object({
      type: z
        .enum([
          'BLOG_POST',
          'EMAIL',
          'SOCIAL_MEDIA',
          'AD_COPY',
          'VIDEO_SCRIPT',
          'NEWSLETTER',
          'PRESS_RELEASE',
        ])
        .describe('The type of content to generate'),
      platform: z
        .enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE', 'EMAIL', 'WEB'])
        .optional()
        .describe('The target platform for the content'),
      topic: z.string().describe('The main topic or subject of the content'),
      tone: z
        .enum([
          'professional',
          'casual',
          'humorous',
          'inspirational',
          'educational',
          'urgent',
          'empathetic',
        ])
        .describe('The tone of voice for the content'),
      audience: z.string().optional().describe('The target audience for this content'),
      keywords: z.array(z.string()).optional().describe('Keywords to include in the content'),
      language: z
        .enum(['en', 'ms', 'zh', 'ar', 'es', 'fr'])
        .default('en')
        .describe('Language to generate the content in'),
      length: z
        .enum(['short', 'medium', 'long'])
        .optional()
        .default('medium')
        .describe('Desired length of the content'),
      additionalContext: z
        .string()
        .optional()
        .describe('Any additional context or specific requirements'),
    }),
  }),

  scheduleSocialPost: tool({
    description:
      'Schedule a social media post to be published at a specific time. Use this when the user wants to schedule content for social media.',
    parameters: z.object({
      platform: z
        .enum(['LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'TIKTOK', 'YOUTUBE'])
        .describe('The social media platform to post on'),
      caption: z.string().describe('The post caption or content'),
      scheduledAt: z
        .string()
        .describe('ISO 8601 datetime string for when to publish the post'),
      mediaUrls: z
        .array(z.string())
        .optional()
        .describe('URLs of media to attach to the post'),
      socialAccountId: z
        .string()
        .optional()
        .describe('The ID of the social account to post from'),
      campaignId: z.string().optional().describe('The ID of the campaign to associate with'),
    }),
  }),

  createCampaign: tool({
    description:
      'Create a new marketing campaign with specified parameters. Use this when the user wants to start or plan a new campaign.',
    parameters: z.object({
      name: z.string().describe('The name of the campaign'),
      type: z
        .enum(['EMAIL', 'SOCIAL', 'CONTENT', 'SEO', 'PAID', 'MULTI_CHANNEL'])
        .describe('The type of campaign'),
      description: z.string().optional().describe('A brief description of the campaign'),
      goal: z.string().optional().describe('The primary goal or objective of the campaign'),
      channels: z.array(z.string()).describe('Marketing channels to use for this campaign'),
      startDate: z
        .string()
        .optional()
        .describe('ISO 8601 date string for campaign start date'),
      endDate: z
        .string()
        .optional()
        .describe('ISO 8601 date string for campaign end date'),
      budget: z.number().optional().describe('Campaign budget in USD'),
      targetAudience: z
        .record(z.unknown())
        .optional()
        .describe('Target audience configuration as a JSON object'),
    }),
  }),

  addContact: tool({
    description:
      'Add a new contact to the CRM. Use this when the user wants to create or add a contact.',
    parameters: z.object({
      email: z.string().email().describe('The contact email address (required)'),
      firstName: z.string().optional().describe("The contact's first name"),
      lastName: z.string().optional().describe("The contact's last name"),
      phone: z.string().optional().describe("The contact's phone number"),
      title: z.string().optional().describe("The contact's job title"),
      company: z.string().optional().describe("The contact's company name"),
      source: z.string().optional().describe('How this contact was acquired'),
      tags: z.array(z.string()).optional().describe('Tags to apply to this contact'),
      notes: z.string().optional().describe('Initial notes about this contact'),
    }),
  }),

  searchContacts: tool({
    description:
      'Search for contacts in the CRM based on criteria. Use this when the user wants to find or look up contacts.',
    parameters: z.object({
      query: z.string().optional().describe('Search query (searches name, email, company)'),
      status: z
        .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CUSTOMER', 'CHURNED'])
        .optional()
        .describe('Filter by contact status'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
      minScore: z.number().optional().describe('Minimum lead score filter'),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of results to return'),
    }),
  }),

  getCampaignAnalytics: tool({
    description:
      'Retrieve analytics data for a specific campaign or all campaigns. Use this to get performance metrics.',
    parameters: z.object({
      campaignId: z
        .string()
        .optional()
        .describe('The ID of a specific campaign (omit for all campaigns)'),
      dateFrom: z
        .string()
        .optional()
        .describe('Start date for analytics data (ISO 8601 format)'),
      dateTo: z
        .string()
        .optional()
        .describe('End date for analytics data (ISO 8601 format)'),
      metrics: z
        .array(
          z.enum(['impressions', 'clicks', 'conversions', 'spend', 'revenue', 'ctr', 'roas'])
        )
        .optional()
        .describe('Specific metrics to retrieve'),
    }),
  }),

  getSocialAnalytics: tool({
    description:
      'Get social media analytics and performance data. Use this when the user wants to see social media metrics.',
    parameters: z.object({
      platform: z
        .enum(['LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'TIKTOK', 'YOUTUBE'])
        .optional()
        .describe('Filter by specific platform (omit for all platforms)'),
      dateFrom: z
        .string()
        .optional()
        .describe('Start date for analytics (ISO 8601 format)'),
      dateTo: z
        .string()
        .optional()
        .describe('End date for analytics (ISO 8601 format)'),
      metrics: z
        .array(z.enum(['followers', 'engagement', 'reach', 'impressions', 'posts']))
        .optional()
        .describe('Specific metrics to retrieve'),
    }),
  }),

  createAutomation: tool({
    description:
      'Create a marketing automation workflow. Use this when the user wants to set up automated sequences or workflows.',
    parameters: z.object({
      name: z.string().describe('The name of the automation'),
      description: z.string().optional().describe('A description of what this automation does'),
      triggerType: z
        .enum([
          'contact_created',
          'deal_stage_changed',
          'form_submitted',
          'tag_added',
          'scheduled',
          'campaign_started',
          'content_published',
        ])
        .describe('The event that triggers this automation'),
      triggerConfig: z
        .record(z.unknown())
        .optional()
        .describe('Additional trigger configuration as JSON'),
      steps: z
        .array(
          z.object({
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
            name: z.string().describe('Name for this step'),
            config: z.record(z.unknown()).describe('Step configuration as JSON'),
          })
        )
        .min(1)
        .describe('The steps in this automation workflow'),
    }),
  }),

  searchContent: tool({
    description:
      'Search for existing content pieces in the workspace. Use this when the user wants to find or reference existing content.',
    parameters: z.object({
      query: z.string().optional().describe('Search query for content title or body'),
      type: z
        .enum([
          'BLOG_POST',
          'EMAIL',
          'SOCIAL_MEDIA',
          'AD_COPY',
          'VIDEO_SCRIPT',
          'NEWSLETTER',
          'PRESS_RELEASE',
        ])
        .optional()
        .describe('Filter by content type'),
      status: z
        .enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'])
        .optional()
        .describe('Filter by content status'),
      language: z
        .enum(['en', 'ms', 'zh', 'ar', 'es', 'fr'])
        .optional()
        .describe('Filter by language'),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of results to return'),
    }),
  }),

  getWorkspaceStats: tool({
    description:
      'Get an overview of workspace statistics and metrics. Use this when the user asks for a summary or overview of their marketing performance.',
    parameters: z.object({
      period: z
        .enum(['today', 'week', 'month', 'quarter', 'year'])
        .optional()
        .default('month')
        .describe('Time period for the statistics'),
      includeMetrics: z
        .array(
          z.enum([
            'campaigns',
            'content',
            'social',
            'contacts',
            'deals',
            'automations',
            'credits',
          ])
        )
        .optional()
        .describe('Specific metrics categories to include'),
    }),
  }),
}

export type AgentToolName = keyof typeof agentTools
