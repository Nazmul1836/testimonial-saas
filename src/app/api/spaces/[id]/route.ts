import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;

    const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
    if (!space) {
      return errorResponse('Space not found', 404);
    }

    return successResponse(space);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
    if (!space) {
      return errorResponse('Space not found', 404);
    }

    // Prepare update data (do not allow updating id, ownerId, slug here)
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.ratingEnabled !== undefined) updateData.ratingEnabled = body.ratingEnabled;
    if (body.fieldConfiguration !== undefined) updateData.fieldConfiguration = body.fieldConfiguration;

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No changes provided', 400);
    }

    const updatedSpace = await db.orm.public.Space.where({ id }).update(updateData);

    return successResponse(updatedSpace);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;

    // Verify ownership
    const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
    if (!space) {
      return errorResponse('Space not found', 404);
    }

    await db.orm.public.Space.where({ id }).delete();

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
