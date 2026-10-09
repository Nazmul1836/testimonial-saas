import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function POST() {
  try {
    await clearSessionCookie();
    return successResponse({ loggedOut: true }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
