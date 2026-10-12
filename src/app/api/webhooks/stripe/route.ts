import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { syncFromCheckoutSession, syncSubscription } from '@/lib/subscription';
import { db } from '@/prisma/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return errorResponse('Webhook not configured', 500);
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return errorResponse('Missing stripe-signature header', 400);
  }

  // Signature verification needs the exact raw body
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (error) {
    console.warn('Stripe webhook signature verification failed:', error instanceof Error ? error.message : error);
    return errorResponse('Invalid signature', 400);
  }

  try {
    // Idempotency: Stripe may deliver the same event more than once
    const alreadyProcessed = await db.orm.public.WebhookEvent.first({ stripeEventId: event.id });
    if (alreadyProcessed) {
      return successResponse({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await syncFromCheckoutSession(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object);
        break;
      default:
        // Other event types are acknowledged but not processed
        break;
    }

    // Recorded only after successful processing, so a failed attempt is retried by Stripe
    try {
      await db.orm.public.WebhookEvent.create({
        stripeEventId: event.id,
        eventType: event.type,
      });
    } catch (error) {
      // A concurrent delivery of the same event already recorded it
      const recorded = await db.orm.public.WebhookEvent.first({ stripeEventId: event.id });
      if (!recorded) throw error;
    }

    return successResponse({ received: true });
  } catch (error) {
    // A 500 makes Stripe retry the delivery
    return handleApiError(error);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const existing =
    (await db.orm.public.Subscription.first({ stripeSubscriptionId: subscription.id })) ??
    (await db.orm.public.Subscription.first({ stripeCustomerId: customerId }));

  if (!existing) {
    // Not linked to a user yet; checkout.session.completed links it
    console.warn(`No local subscription for Stripe subscription ${subscription.id}`);
    return;
  }

  await syncSubscription(existing.userId, subscription);
}
