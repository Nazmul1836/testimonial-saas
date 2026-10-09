import { NextResponse } from 'next/server';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

type ApiErrorResponse = {
  success: false;
  error: string;
};

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    { success: true, data },
    { status }
  );
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json<ApiErrorResponse>(
    { success: false, error: message },
    { status }
  );
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return errorResponse(message, 500);
}
