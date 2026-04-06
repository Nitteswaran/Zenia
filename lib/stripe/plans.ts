import type { PlanName } from '@/lib/plan-limits'

export interface StripePlanConfig {
  name: PlanName
  monthlyPriceId: string
  yearlyPriceId: string
}

export const STRIPE_PLANS: Record<string, StripePlanConfig> = {
  STARTER: {
    name: 'STARTER',
    monthlyPriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
    yearlyPriceId: process.env.STRIPE_PRICE_STARTER_YEARLY ?? '',
  },
  GROWTH: {
    name: 'GROWTH',
    monthlyPriceId: process.env.STRIPE_PRICE_GROWTH_MONTHLY ?? '',
    yearlyPriceId: process.env.STRIPE_PRICE_GROWTH_YEARLY ?? '',
  },
  BUSINESS: {
    name: 'BUSINESS',
    monthlyPriceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? '',
    yearlyPriceId: process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? '',
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    monthlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '',
    yearlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY ?? '',
  },
}

export function getPlanFromPriceId(priceId: string): PlanName | null {
  for (const [planName, config] of Object.entries(STRIPE_PLANS)) {
    if (config.monthlyPriceId === priceId || config.yearlyPriceId === priceId) {
      return planName as PlanName
    }
  }
  return null
}

export function isYearlyPrice(priceId: string): boolean {
  for (const config of Object.values(STRIPE_PLANS)) {
    if (config.yearlyPriceId === priceId) return true
  }
  return false
}

export function getUpgradeUrl(
  plan: PlanName,
  billing: 'monthly' | 'yearly',
  workspaceId: string,
  appUrl?: string
): string {
  const baseUrl = appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const params = new URLSearchParams({
    plan,
    billing,
    workspaceId,
  })
  return `${baseUrl}/api/billing/checkout?${params.toString()}`
}

export function getPriceId(plan: PlanName, billing: 'monthly' | 'yearly'): string | null {
  const config = STRIPE_PLANS[plan]
  if (!config) return null
  return billing === 'monthly' ? config.monthlyPriceId : config.yearlyPriceId
}

export const PLAN_ORDER: PlanName[] = ['FREE', 'STARTER', 'GROWTH', 'BUSINESS', 'ENTERPRISE']

export function comparePlans(planA: PlanName, planB: PlanName): number {
  return PLAN_ORDER.indexOf(planA) - PLAN_ORDER.indexOf(planB)
}
