import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set');
}

// Uses the API version the installed SDK is typed against
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
