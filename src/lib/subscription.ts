import type Stripe from 'stripe';
import { Temporal } from 'temporal-polyfill';
import { stripe } from '@/lib/stripe';
import { db } from '@/prisma/db';

// Stripe statuses that keep Pro access. past_due keeps access while Stripe retries the payment.
const PRO_STATUSES = new Set(['active', 'trialing', 'past_due']);

/**
 * Activates Pro from a completed Checkout Session. The session is always fetched from
 * Stripe by the caller (webhook payload or API lookup), never trusted from the browser.
 * Returns false when the session is not a paid subscription checkout for this user.
 */
export async function syncFromCheckoutSession(session: Stripe.Checkout.Session, expectedUserId?: string) {
  if (session.mode !== 'subscription' || session.status !== 'complete') return false;

  const userId = session.client_reference_id;
  if (!userId || (expectedUserId && userId !== expectedUserId)) return false;

  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!subscriptionId) return false;

  const user = await db.orm.public.User.first({ id: userId });
  if (!user) {
    console.warn(`Checkout session ${session.id} references unknown user ${userId}`);
    return false;
  }

  // Fetch the subscription so status and period end are authoritative
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscription(userId, subscription);
  return true;
}

export async function syncSubscription(userId: string, subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  // Newer API versions report the period end on subscription items
  const periodEnd =
    subscription.items?.data?.[0]?.current_period_end ??
    (subscription as unknown as { current_period_end?: number }).current_period_end;

  const data = {
    plan: PRO_STATUSES.has(subscription.status) ? 'pro' : 'free',
    status: subscription.status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    // Timestamp columns are stored as Temporal.Instant, not Date
    currentPeriodEnd: periodEnd ? Temporal.Instant.fromEpochMilliseconds(periodEnd * 1000) : null,
  };

  const existing = await db.orm.public.Subscription.first({ userId });
  if (existing) {
    await db.orm.public.Subscription.where({ userId }).update(data);
  } else {
    await db.orm.public.Subscription.create({ userId, ...data });
  }
}
