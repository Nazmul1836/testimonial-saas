import { stripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { NextResponse } from 'next/server';

// Opens the Stripe Customer Portal, where Pro users can cancel or update their payment method
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await db.orm.public.Subscription.where({ userId: session.userId }).first();
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer found for this account' }, { status: 400 });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe Portal Error:', error);
    const message = error instanceof Error ? error.message : 'Could not open billing portal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
