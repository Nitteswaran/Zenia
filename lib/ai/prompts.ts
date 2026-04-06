export const ZENIA_SYSTEM_PROMPT = `You are Zenia, an AI marketing operating system.
You help marketing teams execute their entire marketing strategy through natural conversation.
You are proactive, strategic, and action-oriented — you don't just advise, you execute.
When asked to do something, use your tools to actually do it.
Always confirm actions before executing irreversible ones.
Respond concisely and professionally.
When generating content, output only the content itself — never include meta-commentary, usage instructions, or remarks addressed to the user.

Current date: ${new Date().toISOString().split("T")[0]}
`

export function buildContentPrompt({
  type,
  platform,
  topic,
  tone,
  audience,
  keywords,
  length,
  additionalContext,
}: {
  type: string
  platform?: string
  topic: string
  tone: string
  audience?: string
  keywords?: string[]
  length?: string
  additionalContext?: string
}): string {
  const keywordsStr = keywords?.length ? `\nKeywords to include: ${keywords.join(", ")}` : ""
  const audienceStr = audience ? `\nTarget audience: ${audience}` : ""
  const contextStr = additionalContext ? `\nAdditional context: ${additionalContext}` : ""
  const platformStr = platform ? `\nPlatform: ${platform}` : ""
  const lengthMap: Record<string, string> = { short: "~150 words", medium: "~400 words", long: "~800+ words" }
  const lengthStr = length ? `\nTarget length: ${lengthMap[length] ?? length}` : ""

  const typeInstructions: Record<string, string> = {
    BLOG_POST: "Write an SEO-optimised blog post with engaging H2 subheadings, a compelling introduction, actionable body content, and a strong conclusion with CTA. Include a meta description and suggested URL slug at the top.",
    EMAIL: "Write a professional email with clearly labeled sections: Subject line, Preview text, Opening greeting, Body content, CTA button text, Sign-off.",
    SOCIAL_MEDIA: `Write an engaging social media post for ${platform ?? "social media"}. Include relevant emojis, strategic hashtags, and a clear CTA. Optimise for platform-specific character limits and engagement.`,
    AD_COPY: "Write compelling ad copy using the AIDA framework (Attention, Interest, Desire, Action). Provide 3 headline variants and 2 body copy variants.",
    VIDEO_SCRIPT: "Write a video script with clearly labeled sections: Hook (first 5 seconds), Main content points, B-roll suggestions, CTA.",
    NEWSLETTER: "Write a newsletter with clearly labeled sections: Subject line, Preview text, body sections with subheadings, personalisation tokens [{FIRST_NAME}], Unsubscribe notice.",
    PRESS_RELEASE: "Write an AP-style press release with: Headline, Dateline, Lead paragraph (who, what, when, where, why), Body quote, Boilerplate, Contact info placeholder.",
    CAMPAIGN_BRIEF: "Write a structured marketing campaign brief with the following sections: ## Strategy Overview, ## Target Audience, ## Channel Tactics (one subsection per channel), ## Content Calendar (week-by-week for the campaign duration), ## KPIs & Success Metrics. Use markdown headings and bullet points. Be specific and actionable.",
  }

  return `${typeInstructions[type] ?? `Write ${type} content about the following topic.`}

Topic: ${topic}
Tone: ${tone}${platformStr}${audienceStr}${lengthStr}${keywordsStr}${contextStr}

Output only the final content itself — no preamble, no explanations, no editorial notes, no suggestions, and no closing remarks addressed to the user. Do not include sentences like "Feel free to publish this" or "I hope this helps" or any meta-commentary. The output must be ready to copy and publish as-is.`
}
