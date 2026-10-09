import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InboxClient from './InboxClient';

export const instant = false;

export default async function SpaceInboxPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  
  const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
  if (!space) redirect('/dashboard/spaces');

  // Initial fetch for SSR
  const limit = 20;
  let query = db.orm.public.Testimonial.where({ spaceId: id }).where((t) => t.deletedAt.isNull());
  
  const totalResult = await query.aggregate((a) => ({ count: a.count() }));
  const total = totalResult.count;
  
  const testimonials = await query
    .orderBy((t) => t.createdAt.desc())
    .limit(limit)
    .all();

  const meta = {
    total,
    page: 1,
    limit,
    totalPages: Math.ceil(total / limit)
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/dashboard/spaces/${space.id}`} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Inbox: {space.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage submissions for this space.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
              <span className="text-gray-500">Public Link:</span>
              <code>/space/{space.slug}</code>
              <Link href={`/space/${space.slug}`} target="_blank" className="text-primary hover:underline ml-1">
                Visit
              </Link>
            </div>
            <Link 
              href={`/dashboard/spaces/${space.id}`}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>

      <InboxClient 
        spaceId={space.id} 
        initialData={testimonials.map(t => ({
          ...t,
          createdAt: t.createdAt.toString(),
          deletedAt: t.deletedAt ? t.deletedAt.toString() : null
        }))} 
        initialMeta={meta} 
      />
    </div>
  );
}
