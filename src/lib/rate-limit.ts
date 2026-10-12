import { createHash } from 'crypto';
import { Temporal } from 'temporal-polyfill';
import { db } from '@/prisma/db';

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Sliding-window rate limit stored in Postgres, so it holds across server instances.
 * Every allowed call is recorded; once `limit` calls happen within `windowMs`,
 * further calls are refused until the oldest one leaves the window.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = Temporal.Now.instant();
  const windowStart = now.subtract({ milliseconds: windowMs });

  // Prune this key's expired hits so the table stays small
  await db.orm.public.RateLimitHit.where({ key }).where((h) => h.createdAt.lt(windowStart)).deleteAll();

  const recent = db.orm.public.RateLimitHit.where({ key }).where((h) => h.createdAt.gte(windowStart));
  const { count } = await recent.aggregate((a) => ({ count: a.count() }));

  if (count >= limit) {
    const oldest = await recent.orderBy((h) => h.createdAt.asc()).first();
    const freesAtMs = (oldest?.createdAt.epochMilliseconds ?? now.epochMilliseconds) + windowMs;
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((freesAtMs - now.epochMilliseconds) / 1000)) };
  }

  await db.orm.public.RateLimitHit.create({ key });
  return { allowed: true };
}

/** Rate-limit key for the requesting client. The IP is hashed so raw addresses are never stored. */
export function clientKey(req: Request, action: string) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || req.headers.get('x-real-ip')?.trim() || 'unknown';
  return `${action}:${createHash('sha256').update(ip).digest('hex').slice(0, 32)}`;
}
