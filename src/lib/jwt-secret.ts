// Secret used to sign and verify session JWTs. Shared by lib/auth.ts and middleware.ts.
const DEV_FALLBACK_SECRET = 'dev_only_insecure_secret_do_not_use_in_production';
const MIN_SECRET_LENGTH = 32;

let cached: Uint8Array | null = null;
let warned = false;

/**
 * Returns the JWT signing key. In production a missing or short JWT_SECRET is a hard
 * error: a guessable secret would let anyone forge a session for any account.
 * Resolved lazily (not at import) so `next build` works without runtime secrets.
 */
export function getJwtSecret(): Uint8Array {
  if (cached) return cached;

  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= MIN_SECRET_LENGTH) {
    cached = new TextEncoder().encode(secret);
    return cached;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`JWT_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters in production`);
  }

  if (!warned) {
    console.warn(`JWT_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} characters; using an insecure development secret.`);
    warned = true;
  }
  cached = new TextEncoder().encode(DEV_FALLBACK_SECRET);
  return cached;
}
