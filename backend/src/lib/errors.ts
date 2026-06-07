import { Context } from 'hono';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
    super(400, message, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(401, message, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    super(403, message, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', errorCode = 'NOT_FOUND') {
    super(404, message, errorCode);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too Many Requests', errorCode = 'RATE_LIMIT_EXCEEDED') {
    super(429, message, errorCode);
  }
}

export function errorHandler(err: Error, c: Context) {
  console.error('Unhandled error:', err);
  
  if (err instanceof AppError) {
    return c.json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message
      }
    }, err.statusCode as any);
  }
  
  // Zod validation handling or general errors
  if (err.name === 'ZodError') {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input parameters',
        details: (err as any).format()
      }
    }, 400);
  }
  
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An internal server error occurred'
    }
  }, 500);
}
