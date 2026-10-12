import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import { compare, hash } from 'bcryptjs';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { name, currentPassword, newPassword } = await req.json();

    const user = await db.orm.public.User.where({ id: session.userId }).first();
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const updateData: any = {};

    // Handle Name Update
    if (name && name !== user.name) {
      updateData.name = name;
    }

    // Handle Password Update
    if (newPassword) {
      if (!currentPassword) {
        return errorResponse('Current password is required to set a new password', 400);
      }

      const isPasswordValid = await compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return errorResponse('Incorrect current password', 400);
      }

      updateData.passwordHash = await hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No changes provided', 400);
    }

    // Update user in DB
    const updatedUser = await db.orm.public.User.where({ id: session.userId }).update(updateData);
    if (!updatedUser) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
