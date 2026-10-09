import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { generateSlug } from '@/lib/slugify';

// Default field configuration
const DEFAULT_FIELD_CONFIG = {
  customerName: { label: 'Your Name', required: true, enabled: true },
  email: { label: 'Email Address', required: true, enabled: true },
  companyName: { label: 'Company Name', required: false, enabled: true },
  jobTitle: { label: 'Job Title', required: false, enabled: true },
  socialProfileUrl: { label: 'Social Profile URL', required: false, enabled: false },
  profilePhotoUrl: { label: 'Profile Photo', required: false, enabled: true },
  rating: { enabled: true },
};

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const spaces = await db.orm.public.Space.select('id', 'title', 'subtitle', 'slug', 'theme', 'createdAt')
      .where({ ownerId: session.userId })
      .all();

    return successResponse(spaces);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { title, subtitle, theme, fieldConfiguration } = await req.json();

    if (!title) {
      return errorResponse('Title is required', 400);
    }

    // 1. Plan Limit Enforcement
    const subscription = await db.orm.public.Subscription.first({ userId: session.userId });
    const plan = subscription?.plan || 'free';
    
    const spaceCountResult = await db.orm.public.Space.where({ ownerId: session.userId }).aggregate((a) => ({ count: a.count() }));
    const spaceCount = spaceCountResult.count;
    
    if (plan === 'free' && spaceCount >= 3) {
      return errorResponse('Free plan is limited to 3 spaces. Please upgrade.', 403);
    }
    if (plan === 'pro' && spaceCount >= 25) {
      return errorResponse('Pro plan is limited to 25 spaces.', 403);
    }

    // 2. Slug Generation & Collision Handling
    let baseSlug = generateSlug(title);
    if (!baseSlug) baseSlug = 'space'; // fallback

    let slug = baseSlug;
    let collisionCounter = 1;
    
    while (true) {
      const existing = await db.orm.public.Space.first({ slug });
      if (!existing) break;
      slug = `${baseSlug}-${collisionCounter}`;
      collisionCounter++;
    }

    // 3. Create Space
    const newSpace = await db.orm.public.Space.create({
      ownerId: session.userId,
      title,
      subtitle: subtitle || null,
      slug,
      theme: theme || 'default',
      ratingEnabled: true,
      fieldConfiguration: fieldConfiguration || DEFAULT_FIELD_CONFIG,
    });

    return successResponse(newSpace, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
