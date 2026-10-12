import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { syncFromCheckoutSession } from '@/lib/subscription';

// Stripe redirects here after a successful checkout. The session is looked up on
// Stripe's API, so the redirect alone can't activate Pro. This makes the upgrade
// visible immediately even when the webhook hasn't arrived yet (e.g. local dev).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const billingUrl = new URL('/dashboard/settings', url.origin);

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL('/login', url.origin));
  }

  const checkoutSessionId = url.searchParams.get('session_id');
  if (!checkoutSessionId) {
    billingUrl.searchParams.set('checkout', 'error');
    return NextResponse.redirect(billingUrl);
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    const activated = await syncFromCheckoutSession(checkoutSession, session.userId);
    billingUrl.searchParams.set('checkout', activated ? 'success' : 'pending');
  } catch (error) {
    console.error('Checkout confirmation failed:', error);
    billingUrl.searchParams.set('checkout', 'pending');
  }

  return NextResponse.redirect(billingUrl);
}
