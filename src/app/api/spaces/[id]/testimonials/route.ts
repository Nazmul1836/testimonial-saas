import { NextResponse } from 'next/server';
import { db } from '@/prisma/db';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { validateSubmission, type FieldConfiguration } from '@/lib/testimonial-validation';

// Public submissions per visitor (by IP), across all spaces
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const limited = await rateLimit(clientKey(req, 'submit-testimonial'), SUBMIT_LIMIT, SUBMIT_WINDOW_MS);
    if (!limited.allowed) {
      const res = errorResponse('Too many submissions. Please try again later.', 429);
      res.headers.set('Retry-After', String(limited.retryAfterSeconds));
      return res;
    }

    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const space = await db.orm.public.Space.where({ id }).first();
    if (!space) {
      return errorResponse('Space not found', 404);
    }

    const subscription = await db.orm.public.Subscription.where({ userId: space.ownerId }).first();
    const plan = subscription?.plan || 'free';
    const limit = plan === 'pro' ? 1000 : 100;

    // The limit applies per space; deleted testimonials free up room
    const currentCountResult = await db.orm.public.Testimonial.where({ spaceId: space.id })
      .where((t) => t.deletedAt.isNull())
      .aggregate((a) => ({ count: a.count() }));
    if (currentCountResult.count >= limit) {
      return errorResponse('This space is not accepting new testimonials right now.', 403);
    }

    // Validate against the fields this space's owner configured
    const result = validateSubmission(body, (space.fieldConfiguration ?? {}) as FieldConfiguration);
    if (!result.ok) {
      return errorResponse(result.error, 400);
    }

    const newTestimonial = await db.orm.public.Testimonial.create({
      spaceId: space.id,
      ...result.data,
    });

    return successResponse(newTestimonial, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const url = new URL(req.url);
    const search = url.searchParams.get('q') || '';
    const filter = url.searchParams.get('filter') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const space = await db.orm.public.Space.where({ id, ownerId: session.userId }).first();
    if (!space) {
      return errorResponse('Space not found or unauthorized', 404);
    }

    let query = db.orm.public.Testimonial.where({ spaceId: id });
    query = query.where((t) => t.deletedAt.isNull());

    if (search) {
      const q = `%${search}%`;
      const { or } = await import('@prisma/orm-postgres/orm-client');
      query = query.where((t) => or(
        t.customerName.ilike(q),
        t.email.ilike(q),
        t.testimonialText.ilike(q)
      ));
    }

    if (filter === 'favorite') query = query.where({ favorite: true });
    else if (filter === 'featured') query = query.where({ featured: true });
    else if (filter === 'hidden') query = query.where({ hidden: true });

    const totalResult = await query.aggregate((a) => ({ count: a.count() }));
    const total = totalResult.count;
    const offset = (page - 1) * limit;
    
    const testimonials = await query
      .orderBy((t) => t.createdAt.desc())
      .limit(limit)
      .offset(offset)
      .all();

    return successResponse({
      data: testimonials,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
