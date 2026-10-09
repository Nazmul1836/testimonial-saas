import { db } from '@/prisma/db';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
  if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 });

  let config = await db.orm.public.WidgetConfiguration.where({ spaceId: id }).first();
  if (!config) {
    // create default
    config = await db.orm.public.WidgetConfiguration.create({
      spaceId: id,
      layout: 'masonry',
      themeMode: 'light',
      animation: 'none'
    });
  }

  return NextResponse.json(config);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
  if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 });

  const body = await request.json();

  let config = await db.orm.public.WidgetConfiguration.where({ spaceId: id }).first();
  if (!config) {
    config = await db.orm.public.WidgetConfiguration.create({
      spaceId: id,
      layout: body.layout || 'masonry',
      themeMode: body.themeMode || 'light',
      backgroundColor: body.backgroundColor || null,
      animation: body.animation || 'none'
    });
  } else {
    config = await db.orm.public.WidgetConfiguration.update({
      where: { id: config.id },
      data: {
        layout: body.layout,
        themeMode: body.themeMode,
        backgroundColor: body.backgroundColor,
        animation: body.animation
      }
    });
  }

  return NextResponse.json(config);
}
