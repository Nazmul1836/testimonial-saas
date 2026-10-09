import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/prisma/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return errorResponse('Missing email or password', 400);
    }

    // Find the user
    const user = await db.orm.public.User.first({ email });
    
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Compare passwords
    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Set the session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
    });

    return successResponse({
      id: user.id,
      name: user.name,
      email: user.email,
    }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
