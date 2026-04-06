import type { Contact, Deal, Activity } from "@prisma/client"
import type { LeadScoreResult, ScoreLabel } from "@/types"

type ContactWithRelations = Contact & {
  deals?: Deal[]
  activities?: Activity[]
}

/**
 * Calculate lead score (0–100) from available CRM data only.
 * No external API calls — deterministic and fast for batch processing.
 */
export function calculateLeadScore(contact: ContactWithRelations): LeadScoreResult {
  let profileCompleteness = 0
  let statusScore = 0
  let dealActivity = 0
  let activityRecency = 0
  let tagBonus = 0

  // ── Profile completeness (max 20) ────────────────────────────────────────
  if (contact.firstName || contact.lastName) profileCompleteness += 5
  if (contact.phone) profileCompleteness += 3
  if (contact.title) profileCompleteness += 4
  if (contact.companyId) profileCompleteness += 5
  if (contact.source) profileCompleteness += 3

  // ── Status score (max 35) ─────────────────────────────────────────────────
  const STATUS_SCORES: Record<string, number> = {
    NEW: 5,
    CONTACTED: 15,
    QUALIFIED: 30,
    UNQUALIFIED: 2,
    CUSTOMER: 35,
    CHURNED: 0,
  }
  statusScore = STATUS_SCORES[contact.status] ?? 0

  // ── Deal activity (max 25) ────────────────────────────────────────────────
  const deals = contact.deals ?? []
  if (deals.length > 0) dealActivity += 10
  if (deals.some((d) => ["PROPOSAL", "NEGOTIATION"].includes(d.stage))) dealActivity += 10
  if (deals.some((d) => d.stage === "CLOSED_WON")) dealActivity += 25
  if (deals.some((d) => d.stage === "CLOSED_LOST")) dealActivity = Math.max(0, dealActivity - 5)
  dealActivity = Math.min(dealActivity, 25)

  // ── Activity recency (max 15) ─────────────────────────────────────────────
  const activities = contact.activities ?? []
  const now = Date.now()
  const latestActivity = activities[0] // assumes sorted desc
  if (latestActivity) {
    const ageMs = now - new Date(latestActivity.createdAt).getTime()
    if (ageMs < 7 * 86_400_000) activityRecency = 15          // < 7 days
    else if (ageMs < 30 * 86_400_000) activityRecency = 10     // < 30 days
    else if (ageMs < 90 * 86_400_000) activityRecency = 5      // < 90 days
  }
  // bonus for many interactions
  if (activities.length >= 5) activityRecency = Math.min(activityRecency + 3, 15)

  // ── Tag bonus (max 5) ─────────────────────────────────────────────────────
  const hotTags = ["hot", "enterprise", "vip", "priority", "champion", "decision-maker"]
  const hasHotTag = contact.tags.some((t) => hotTags.includes(t.toLowerCase()))
  if (hasHotTag) tagBonus = 5

  const score = Math.min(
    100,
    profileCompleteness + statusScore + dealActivity + activityRecency + tagBonus
  )

  const label: ScoreLabel =
    score >= 65 ? "hot"
    : score >= 35 ? "warm"
    : "cold"

  return {
    contactId: contact.id,
    score,
    label,
    breakdown: { profileCompleteness, statusScore, dealActivity, activityRecency, tagBonus },
  }
}
