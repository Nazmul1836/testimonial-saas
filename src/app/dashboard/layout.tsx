import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { Suspense } from 'react';

async function DashboardInner({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row relative">
      {/* Decorative background blur for dashboard */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* Sidebar Navigation */}
      <aside className="w-full sm:w-72 glass border-r border-gray-200/50 dark:border-gray-800/50 p-6 flex flex-col z-10 shadow-xl shadow-primary/5">
        <div className="flex items-center gap-3 mb-10 mt-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="font-heading font-black text-2xl tracking-tight text-foreground">TrustFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-foreground transition-all">
            Dashboard
          </Link>
          <Link href="/dashboard/spaces" className="flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-foreground transition-all">
            Spaces
          </Link>
          <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-foreground transition-all">
            Account Settings
          </Link>
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-800/50">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 px-4 truncate mb-4">{session.email}</p>
          <div className="px-4">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto animate-fade-in-up">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>}>
      <DashboardInner>{children}</DashboardInner>
    </Suspense>
  );
}
