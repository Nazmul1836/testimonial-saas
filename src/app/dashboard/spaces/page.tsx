import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import Link from 'next/link';

export const instant = false;

export default async function SpacesPage() {
  const session = await getSession();
  if (!session) return null;

  const spaces = await db.orm.public.Space.select('id', 'title', 'subtitle', 'slug')
    .where({ ownerId: session.userId })
    .all();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Spaces</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your testimonial collection spaces.</p>
        </div>
        <Link 
          href="/dashboard/spaces/new" 
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Create New Space
        </Link>
      </header>

      {spaces.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground">No spaces yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 mb-6">Create your first space to start collecting testimonials.</p>
          <Link 
            href="/dashboard/spaces/new" 
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create Space
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Link 
              key={space.id} 
              href={`/dashboard/spaces/${space.id}`}
              className="group block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
            >
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{space.title}</h3>
              {space.subtitle && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{space.subtitle}</p>}
              
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  /{space.slug}
                </span>
                <span className="text-sm text-primary font-medium flex items-center group-hover:translate-x-1 transition-transform">
                  Manage
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
