/**
 * Framework-agnostic HTTP error used across API modules.
 * The Fastify error handler maps these to the platform error envelope:
 *   { "error": { "code", "message", "details" } }
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, "BAD_REQUEST", message, details);

export const unauthorized = (message = "Authentication required") =>
  new HttpError(401, "UNAUTHENTICATED", message);

export const forbidden = (message = "You do not have permission to perform this action") =>
  new HttpError(403, "FORBIDDEN", message);

export const notFound = (message = "Resource not found") =>
  new HttpError(404, "NOT_FOUND", message);

export const conflict = (code: string, message: string) => new HttpError(409, code, message);

export const gone = (code: string, message: string) => new HttpError(410, code, message);
