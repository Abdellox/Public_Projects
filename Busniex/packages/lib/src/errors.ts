/**
 * Domain errors with an HTTP status code, safe for API boundaries.
 * Every module throws typed errors handled by the shared error middleware.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  badRequest(message = 'Bad request', details?: unknown) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  },
  unauthorized(message = 'Unauthorized') {
    return new AppError(401, 'UNAUTHORIZED', message);
  },
  forbidden(message = 'Forbidden') {
    return new AppError(403, 'FORBIDDEN', message);
  },
  notFound(message = 'Not found') {
    return new AppError(404, 'NOT_FOUND', message);
  },
  conflict(message = 'Conflict', details?: unknown) {
    return new AppError(409, 'CONFLICT', message, details);
  },
  validation(message = 'Validation failed', details?: unknown) {
    return new AppError(422, 'VALIDATION_ERROR', message, details);
  },
  internal(message = 'Internal server error') {
    return new AppError(500, 'INTERNAL', message);
  },
};
