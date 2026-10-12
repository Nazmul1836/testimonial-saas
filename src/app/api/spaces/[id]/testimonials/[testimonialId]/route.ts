import { NextResponse } from 'next/server';
import { Temporal } from 'temporal-polyfill';
import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string, testimonialId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { id, testimonialId } = await params;
    const body = await req.json();

    // Verify space ownership
    const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
    if (!space) {
      return errorResponse('Space not found or unauthorized', 404);
    }

    const testimonial = await db.orm.public.Testimonial.where({ id: testimonialId, spaceId: id }).first();
    if (!testimonial) {
      return errorResponse('Testimonial not found', 404);
    }

    const updateData: any = {};
    if (body.favorite !== undefined) updateData.favorite = body.favorite;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.hidden !== undefined) updateData.hidden = body.hidden;

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No changes provided', 400);
    }

    const updated = await db.orm.public.Testimonial.where({ id: testimonialId }).update(updateData);
    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, testimonialId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { id, testimonialId } = await params;

    // Verify space ownership
    const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
    if (!space) {
      return errorResponse('Space not found or unauthorized', 404);
    }

    const testimonial = await db.orm.public.Testimonial.where({ id: testimonialId, spaceId: id }).first();
    if (!testimonial) {
      return errorResponse('Testimonial not found', 404);
    }

    // Soft delete (timestamp columns are stored as Temporal.Instant, not Date)
    const updated = await db.orm.public.Testimonial.where({ id: testimonialId }).update({
      deletedAt: Temporal.Now.instant(),
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
