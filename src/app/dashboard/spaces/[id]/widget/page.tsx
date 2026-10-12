import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import WidgetBuilderClient from './WidgetBuilderClient';

export const instant = false;

export default async function WidgetBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
  if (!space) redirect('/dashboard/spaces');

  let config = await db.orm.public.WidgetConfiguration.where({ spaceId: id }).first();
  if (!config) {
    config = await db.orm.public.WidgetConfiguration.create({
      spaceId: id,
      layout: 'masonry',
      themeMode: 'light',
      animation: 'none'
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/spaces/${id}`} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl font-bold">Widget Builder: {space.title}</h1>
      </div>

      <WidgetBuilderClient spaceId={id} initialConfig={{
        id: config.id,
        spaceId: config.spaceId,
        layout: config.layout,
        themeMode: config.themeMode,
        backgroundColor: config.backgroundColor,
        animation: config.animation,
      }} />
    </div>
  );
}
