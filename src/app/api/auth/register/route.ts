import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/prisma/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email: rawEmail, password } = await req.json();

    if (!name || !rawEmail || !password) {
      return errorResponse('Missing required fields', 400);
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    // Emails are case-insensitive: store and match them in lowercase
    const email = String(rawEmail).trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db.orm.public.User.first({ email });

    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash the password
    const passwordHash = await hash(password, 10);

    // Create the new user
    const newUser = await db.orm.public.User.create({
      name,
      email,
      passwordHash,
    });

    // Sign the new user in, replacing any previous session
    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
    });

    return successResponse({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
