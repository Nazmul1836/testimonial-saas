// Server-side validation for public testimonial submissions.
// The public form validates too, but anyone can call the API directly.

type FieldSetting = { enabled?: boolean; required?: boolean; label?: string };

export type FieldConfiguration = {
  customerName?: FieldSetting;
  email?: FieldSetting;
  companyName?: FieldSetting;
  jobTitle?: FieldSetting;
  socialProfileUrl?: FieldSetting;
  profilePhotoUrl?: FieldSetting;
  rating?: { enabled?: boolean };
};

export type ValidSubmission = {
  customerName: string;
  email: string;
  companyName: string | null;
  jobTitle: string | null;
  socialProfileUrl: string | null;
  profilePhotoUrl: string | null;
  testimonialText: string;
  rating: number | null;
  sharingConsent: boolean;
};

export type ValidationResult = { ok: true; data: ValidSubmission } | { ok: false; error: string };

export const LIMITS = {
  name: 100,
  email: 254,
  shortText: 100,
  url: 500,
  testimonialText: 2000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Photos must come from this app's upload endpoint (local dev) or Vercel Blob (production)
const LOCAL_UPLOAD_RE = /^\/uploads\/[A-Za-z0-9._-]+$/;
const BLOB_HOST_RE = /\.public\.blob\.vercel-storage\.com$/;

const OPTIONAL_FIELDS = [
  { key: 'companyName', label: 'Company name', kind: 'text' },
  { key: 'jobTitle', label: 'Job title', kind: 'text' },
  { key: 'socialProfileUrl', label: 'Social profile URL', kind: 'url' },
  { key: 'profilePhotoUrl', label: 'Profile photo', kind: 'photo' },
] as const;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isAllowedPhotoUrl(value: string) {
  if (LOCAL_UPLOAD_RE.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && BLOB_HOST_RE.test(url.hostname);
  } catch {
    return false;
  }
}

/** Returns the trimmed string, '' when absent, or null when the value is not a string. */
function readString(value: unknown): string | null {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return null;
  return value.trim();
}

export function validateSubmission(body: unknown, config: FieldConfiguration): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid submission' };
  }
  const input = body as Record<string, unknown>;

  // Name and email are on by default; owners can only change whether they're required
  const nameSetting = config.customerName ?? { enabled: true, required: true };
  const emailSetting = config.email ?? { enabled: true, required: true };

  const customerName = nameSetting.enabled === false ? '' : readString(input.customerName);
  if (customerName === null) return { ok: false, error: 'Name must be text' };
  if (nameSetting.enabled !== false && nameSetting.required && !customerName) return { ok: false, error: 'Name is required' };
  if (customerName.length > LIMITS.name) return { ok: false, error: `Name must be at most ${LIMITS.name} characters` };

  const email = emailSetting.enabled === false ? '' : readString(input.email)?.toLowerCase() ?? null;
  if (email === null) return { ok: false, error: 'Email must be text' };
  if (emailSetting.enabled !== false && emailSetting.required && !email) return { ok: false, error: 'Email is required' };
  if (email && (email.length > LIMITS.email || !EMAIL_RE.test(email))) return { ok: false, error: 'Please enter a valid email address' };

  const optional: Record<string, string | null> = {};
  for (const field of OPTIONAL_FIELDS) {
    const setting = config[field.key];
    // Disabled fields are never stored, whatever the client sends
    if (!setting?.enabled) {
      optional[field.key] = null;
      continue;
    }
    const value = readString(input[field.key]);
    if (value === null) return { ok: false, error: `${field.label} must be text` };
    if (!value) {
      if (setting.required) return { ok: false, error: `${field.label} is required` };
      optional[field.key] = null;
      continue;
    }
    const max = field.kind === 'text' ? LIMITS.shortText : LIMITS.url;
    if (value.length > max) return { ok: false, error: `${field.label} must be at most ${max} characters` };
    if (field.kind === 'url' && !isHttpUrl(value)) return { ok: false, error: `${field.label} must be a valid http(s) link` };
    if (field.kind === 'photo' && !isAllowedPhotoUrl(value)) return { ok: false, error: 'Profile photo must be uploaded through the form' };
    optional[field.key] = value;
  }

  const testimonialText = readString(input.testimonialText);
  if (testimonialText === null) return { ok: false, error: 'Testimonial must be text' };
  if (!testimonialText) return { ok: false, error: 'Testimonial text is required' };
  if (testimonialText.length > LIMITS.testimonialText) {
    return { ok: false, error: `Testimonial must be at most ${LIMITS.testimonialText} characters` };
  }

  let rating: number | null = null;
  if (config.rating?.enabled && input.rating !== undefined && input.rating !== null) {
    if (typeof input.rating !== 'number' || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      return { ok: false, error: 'Rating must be a whole number from 1 to 5' };
    }
    rating = input.rating;
  }

  return {
    ok: true,
    data: {
      customerName: customerName || 'Anonymous',
      email: email || 'no-email@example.com',
      companyName: optional.companyName,
      jobTitle: optional.jobTitle,
      socialProfileUrl: optional.socialProfileUrl,
      profilePhotoUrl: optional.profilePhotoUrl,
      testimonialText,
      rating,
      // Only an explicit true counts as consent (e.g. the string "false" must not)
      sharingConsent: input.sharingConsent === true,
    },
  };
}
