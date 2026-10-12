import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';
import UpgradeButton from './UpgradeButton';
import ManageBillingButton from './ManageBillingButton';

export const instant = false;

const CHECKOUT_MESSAGES: Record<string, { text: string; className: string }> = {
  success: {
    text: 'Payment confirmed — welcome to Pro!',
    className: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  },
  pending: {
    text: 'We are still confirming your payment with Stripe. Refresh this page in a moment.',
    className: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  },
  cancelled: {
    text: 'Checkout was cancelled. You have not been charged.',
    className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700',
  },
  error: {
    text: 'Something went wrong while confirming your checkout. Please contact support if you were charged.',
    className: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  },
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Payment past due',
  canceled: 'Canceled',
  unpaid: 'Unpaid',
  incomplete: 'Incomplete',
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch current user
  const user = await db.orm.public.User.first({ id: session.userId });

  if (!user) {
    redirect('/login');
  }

  const { checkout } = await searchParams;
  const checkoutMessage = checkout ? CHECKOUT_MESSAGES[checkout] : undefined;

  const subscription = await db.orm.public.Subscription.first({ userId: session.userId });
  const isPro = subscription?.plan === 'pro';
  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd.epochMilliseconds).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile and security preferences.</p>
      </header>

      {checkoutMessage && (
        <div role="status" className={`p-4 rounded-xl border text-sm font-medium ${checkoutMessage.className}`}>
          {checkoutMessage.text}
        </div>
      )}

      <SettingsForm
        initialName={user.name}
        email={user.email}
      />

      <div id="billing" className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 mt-8">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Billing & Subscription</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          {isPro ? (
            <div>
              <p className="font-semibold text-foreground">
                Pro Plan{' '}
                <span className="ml-2 align-middle text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {STATUS_LABELS[subscription.status] ?? subscription.status}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Up to 25 spaces and 1,000 testimonials per space.
                {renewalDate && ` Renews on ${renewalDate}.`}
              </p>
              {subscription.status === 'past_due' && (
                <p className="text-sm text-red-600 mt-1">Your last payment failed. Update your payment method to keep Pro.</p>
              )}
            </div>
          ) : (
            <div>
              <p className="font-semibold text-foreground">Free Plan</p>
              <p className="text-sm text-gray-500">
                Up to 3 spaces and 100 testimonials per space.
                {subscription?.status === 'canceled' && ' Your Pro subscription was canceled.'}
              </p>
            </div>
          )}
          {isPro ? <ManageBillingButton /> : <UpgradeButton />}
        </div>
      </div>
    </div>
  );
}
