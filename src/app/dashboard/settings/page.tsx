import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';
import UpgradeButton from './UpgradeButton';

export const instant = false;

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch current user
  const user = await db.orm.public.User.first({ id: session.userId });
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile and security preferences.</p>
      </header>

      <SettingsForm 
        initialName={user.name} 
        email={user.email} 
      />

      <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 mt-8">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Billing & Subscription</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-semibold text-foreground">Free Plan</p>
            <p className="text-sm text-gray-500">You are currently on the Free tier.</p>
          </div>
          <UpgradeButton />
        </div>
      </div>
    </div>
  );
}
