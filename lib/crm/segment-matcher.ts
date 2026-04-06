import type { Contact } from "@prisma/client"
import type { SegmentCondition, SegmentFilters } from "@/types"

/**
 * Build a Prisma `where` clause from segment filters.
 * Used both in the API (server-side) and in-memory evaluation.
 */
export function buildSegmentWhere(
  workspaceId: string,
  filters: SegmentFilters
): Record<string, unknown> {
  const conditions = filters.conditions.map(conditionToWhere)
  const combined =
    filters.logic === "OR" ? { OR: conditions } : { AND: conditions }
  return { workspaceId, ...combined }
}

function conditionToWhere(c: SegmentCondition): Record<string, unknown> {
  const now = new Date()

  switch (c.field) {
    case "status":
      if (c.operator === "equals") return { status: c.value }
      if (c.operator === "not_equals") return { NOT: { status: c.value } }
      if (c.operator === "in") return { status: { in: c.value as string[] } }
      if (c.operator === "not_in") return { NOT: { status: { in: c.value as string[] } } }
      break

    case "score":
      if (c.operator === "gte") return { score: { gte: Number(c.value) } }
      if (c.operator === "lte") return { score: { lte: Number(c.value) } }
      if (c.operator === "equals") return { score: Number(c.value) }
      break

    case "tags":
      if (c.operator === "contains") return { tags: { has: c.value as string } }
      if (c.operator === "not_contains") return { NOT: { tags: { has: c.value as string } } }
      if (c.operator === "in") return { tags: { hasSome: c.value as string[] } }
      break

    case "source":
      if (c.operator === "equals") return { source: c.value }
      if (c.operator === "not_equals") return { NOT: { source: c.value } }
      if (c.operator === "contains") return { source: { contains: c.value as string, mode: "insensitive" } }
      break

    case "lifecycleStage":
      if (c.operator === "equals") return { lifecycleStage: c.value }
      if (c.operator === "not_equals") return { NOT: { lifecycleStage: c.value } }
      if (c.operator === "in") return { lifecycleStage: { in: c.value as string[] } }
      break

    case "lastInteractionAt":
      if (c.operator === "within_days") {
        const cutoff = new Date(now.getTime() - Number(c.value) * 86_400_000)
        return { lastInteractionAt: { gte: cutoff } }
      }
      if (c.operator === "older_than_days") {
        const cutoff = new Date(now.getTime() - Number(c.value) * 86_400_000)
        return { lastInteractionAt: { lte: cutoff } }
      }
      break

    case "createdAt":
      if (c.operator === "within_days") {
        const cutoff = new Date(now.getTime() - Number(c.value) * 86_400_000)
        return { createdAt: { gte: cutoff } }
      }
      if (c.operator === "older_than_days") {
        const cutoff = new Date(now.getTime() - Number(c.value) * 86_400_000)
        return { createdAt: { lte: cutoff } }
      }
      break

    case "title":
      if (c.operator === "contains") return { title: { contains: c.value as string, mode: "insensitive" } }
      if (c.operator === "equals") return { title: c.value }
      break

    case "companyId":
      if (c.operator === "equals") return { companyId: c.value }
      if (c.operator === "not_equals") return { NOT: { companyId: c.value } }
      break
  }

  return {}
}

/**
 * Evaluate a segment against a single in-memory contact (for previewing).
 */
export function contactMatchesSegment(contact: Contact, filters: SegmentFilters): boolean {
  const results = filters.conditions.map((c) => evaluateCondition(contact, c))
  return filters.logic === "OR" ? results.some(Boolean) : results.every(Boolean)
}

function evaluateCondition(contact: Contact, c: SegmentCondition): boolean {
  const now = Date.now()

  switch (c.field) {
    case "status":
      if (c.operator === "equals") return contact.status === c.value
      if (c.operator === "not_equals") return contact.status !== c.value
      if (c.operator === "in") return (c.value as string[]).includes(contact.status)
      if (c.operator === "not_in") return !(c.value as string[]).includes(contact.status)
      break

    case "score":
      if (c.operator === "gte") return contact.score >= Number(c.value)
      if (c.operator === "lte") return contact.score <= Number(c.value)
      if (c.operator === "equals") return contact.score === Number(c.value)
      break

    case "tags":
      if (c.operator === "contains") return contact.tags.includes(c.value as string)
      if (c.operator === "not_contains") return !contact.tags.includes(c.value as string)
      if (c.operator === "in") return (c.value as string[]).some((t) => contact.tags.includes(t))
      break

    case "source":
      if (c.operator === "equals") return contact.source === c.value
      if (c.operator === "not_equals") return contact.source !== c.value
      if (c.operator === "contains") return (contact.source ?? "").toLowerCase().includes((c.value as string).toLowerCase())
      break

    case "lifecycleStage":
      if (c.operator === "equals") return (contact as { lifecycleStage?: string }).lifecycleStage === c.value
      if (c.operator === "in") return (c.value as string[]).includes((contact as { lifecycleStage?: string }).lifecycleStage ?? "")
      break

    case "lastInteractionAt": {
      const ts = (contact as { lastInteractionAt?: Date | null }).lastInteractionAt
      if (!ts) return false
      const age = now - new Date(ts).getTime()
      const cutoff = Number(c.value) * 86_400_000
      if (c.operator === "within_days") return age <= cutoff
      if (c.operator === "older_than_days") return age >= cutoff
      break
    }

    case "createdAt": {
      const age = now - new Date(contact.createdAt).getTime()
      const cutoff = Number(c.value) * 86_400_000
      if (c.operator === "within_days") return age <= cutoff
      if (c.operator === "older_than_days") return age >= cutoff
      break
    }

    case "title":
      if (c.operator === "contains") return (contact.title ?? "").toLowerCase().includes((c.value as string).toLowerCase())
      if (c.operator === "equals") return contact.title === c.value
      break

    case "companyId":
      if (c.operator === "equals") return contact.companyId === c.value
      if (c.operator === "not_equals") return contact.companyId !== c.value
      break
  }

  return false
}
