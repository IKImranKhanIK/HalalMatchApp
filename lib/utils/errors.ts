/**
 * Error Handling Utilities
 * Standardized error responses and logging
 */

import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Create a standardized error response
 * Sanitizes error messages to avoid exposing sensitive information
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): NextResponse {
  // Log the actual error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', error);
  } else {
    // In production, log to a service (e.g., Sentry, LogRocket)
    // For now, just log a sanitized version
    console.error('Error occurred:', defaultMessage);
  }

  // Handle known AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV !== 'production' && error.details
          ? { details: error.details }
          : {}),
      },
      { status: error.statusCode }
    );
  }

  // Handle known Error
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'production' ? defaultMessage : error.message;

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  // Unknown error
  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
}

/**
 * Common error creators
 */
export const Errors = {
  Unauthorized: () => new AppError(401, 'Unauthorized', 'UNAUTHORIZED'),
  Forbidden: (message = 'Forbidden') =>
    new AppError(403, message, 'FORBIDDEN'),
  NotFound: (resource = 'Resource') =>
    new AppError(404, `${resource} not found`, 'NOT_FOUND'),
  BadRequest: (message: string) =>
    new AppError(400, message, 'BAD_REQUEST'),
  Conflict: (message: string) => new AppError(409, message, 'CONFLICT'),
  TooManyRequests: (message = 'Too many requests') =>
    new AppError(429, message, 'RATE_LIMIT_EXCEEDED'),
  InternalError: (message = 'Internal server error') =>
    new AppError(500, message, 'INTERNAL_ERROR'),
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch and handle errors consistently
 */
export function asyncHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}
