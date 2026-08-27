import { z } from 'zod';
import type { Context } from 'hono';
import type { ApiErrorBody } from '@nexora/types';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }
  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'UNAUTHENTICATED', message);
  }
  static forbidden(message = 'You do not have permission to do that') {
    return new ApiError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }
  static conflict(message = 'Conflict', details?: unknown) {
    return new ApiError(409, 'CONFLICT', message, details);
  }
  static validation(details: unknown) {
    return new ApiError(422, 'VALIDATION_ERROR', 'Validation failed', details);
  }
  static tooManyRequests(retryAfterSeconds: number) {
    return new ApiError(429, 'RATE_LIMITED', 'Too many requests', {
      retryAfterSeconds,
    });
  }
}

export function errorBody(
  code: string,
  message: string,
  details?: unknown,
): { error: ApiErrorBody['error'] } {
  return { error: { code, message, ...(details ? { details } : {}) } };
}

export async function parseBody<Schema extends z.ZodTypeAny>(
  c: Context,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const raw = await c.req
    .json()
    .catch(() => ApiError.badRequest('Request body must be valid JSON'));

  if (raw instanceof ApiError) throw raw;

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw ApiError.validation(result.error.flatten().fieldErrors);
  }
  return result.data as z.infer<Schema>;
}

export function clientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return c.req.header('x-real-ip') ?? 'local';
}

const PG_UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === PG_UNIQUE_VIOLATION
  );
}
