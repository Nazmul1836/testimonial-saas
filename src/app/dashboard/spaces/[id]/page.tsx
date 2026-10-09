import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import SpaceForm from '../SpaceForm';
import Link from 'next/link';

export const instant = false;

export default async function EditSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  
  const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
  if (!space) redirect('/dashboard/spaces');

  // Convert fieldConfiguration from unknown to any or expected type to pass to form
  const initialData = {
    ...space,
    createdAt: space.createdAt.toString(),
    updatedAt: space.updatedAt.toString(),
    fieldConfiguration: space.fieldConfiguration as any,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/spaces" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Edit Space: {space.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">Update your space settings.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/dashboard/spaces/${space.id}/widget`}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Widget Builder
            </Link>
            <Link 
              href={`/dashboard/spaces/${space.id}/inbox`}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Inbox
            </Link>
          </div>
        </div>
      </div>

      {/* Public URL Box */}
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-primary">Public Collection URL</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Share this link with your customers to collect testimonials.</p>
        </div>
        <div className="flex items-center gap-3">
          <code className="text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-foreground">
            /space/{space.slug}
          </code>
          {/* Note: the user would need to add their domain here in prod. Using /space/{slug} for now. */}
          <Link 
            href={`/space/${space.slug}`} 
            target="_blank"
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Visit Link
          </Link>
        </div>
      </div>

      <SpaceForm isEditing={true} initialData={initialData} />
    </div>
  );
}
