import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { rateLimit, clientKey } from '@/lib/rate-limit';

// Public endpoint used by the testimonial form for profile photos
const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_LIMIT = 10;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;

/** Identifies the image type from the file's first bytes; the client's filename and Content-Type are not trusted. */
function detectImageType(bytes: Buffer): { ext: string; contentType: string } | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: 'png', contentType: 'image/png' };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: 'jpg', contentType: 'image/jpeg' };
  }
  if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))) {
    return { ext: 'gif', contentType: 'image/gif' };
  }
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { ext: 'webp', contentType: 'image/webp' };
  }
  return null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await rateLimit(clientKey(request, 'upload'), UPLOAD_LIMIT, UPLOAD_WINDOW_MS);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: 'Too many uploads. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } }
    );
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await request.arrayBuffer());
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 413 });
    }

    const type = detectImageType(buffer);
    if (!type) {
      return NextResponse.json({ error: 'Only PNG, JPEG, GIF, or WebP images are allowed' }, { status: 415 });
    }

    // Server-generated name, so the client can't choose the path or extension
    const filename = `${randomUUID()}.${type.ext}`;

    // If we have a Vercel Blob token, use it (for Production)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`profile-photos/${filename}`, buffer, {
        access: 'public',
        contentType: type.contentType,
      });
      return NextResponse.json({ url: blob.url });
    }

    // Fallback: Local filesystem upload (for Development)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
