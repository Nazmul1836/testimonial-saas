import { stripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    console.error('STRIPE_PRO_PRICE_ID is not configured in environment variables');
    return NextResponse.json(
      { error: 'Stripe product configuration missing' },
      { status: 500 }
    );
  }

  // Get user to check for an existing stripe customer ID
  const subscription = await db.orm.public.Subscription.where({ userId: session.userId }).first();
  const user = await db.orm.public.User.where({ id: session.userId }).first();

  try {
    let customerId = subscription?.stripeCustomerId;

    // Create a new checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId || undefined,
      customer_email: customerId ? undefined : user?.email, // Only send email if no customer ID exists
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: session.userId, // Very important for linking webhook
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancelled`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
