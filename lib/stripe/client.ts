import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return stripeInstance
}

export interface CreateCheckoutSessionParams {
  customerId?: string
  priceId: string
  workspaceId: string
  userId: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
}

export async function createCheckoutSession({
  customerId,
  priceId,
  workspaceId,
  userId,
  successUrl,
  cancelUrl,
  trialDays,
}: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient()

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      workspaceId,
      userId,
    },
    subscription_data: {
      metadata: {
        workspaceId,
        userId,
      },
    },
  }

  if (customerId) {
    sessionParams.customer = customerId
  }

  if (trialDays) {
    sessionParams.subscription_data = {
      ...sessionParams.subscription_data,
      trial_period_days: trialDays,
    }
  }

  return await stripe.checkout.sessions.create(sessionParams)
}

export interface CreateBillingPortalSessionParams {
  customerId: string
  returnUrl: string
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: CreateBillingPortalSessionParams): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripeClient()

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export interface CreateCustomerParams {
  email: string
  name?: string
  metadata?: Record<string, string>
}

export async function createCustomer({
  email,
  name,
  metadata,
}: CreateCustomerParams): Promise<Stripe.Customer> {
  const stripe = getStripeClient()

  return await stripe.customers.create({
    email,
    name,
    metadata,
  })
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  const stripe = getStripeClient()

  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return null
    return customer as Stripe.Customer
  } catch {
    return null
  }
}

export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripeClient()

  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch {
    return null
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient()

  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }

  return await stripe.subscriptions.cancel(subscriptionId)
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripeClient()

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
