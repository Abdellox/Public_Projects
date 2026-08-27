import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types';
import { ApiError, clientIp } from './errors';

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitStore {
  hit(
    key: string,
    limit: number,
    windowMs: number,
  ): { allowed: boolean; retryAfterSeconds: number };
}

/**
 * Fixed-window in-memory limiter. Correct for a single node;
 * swap the store for Redis when running multiple instances.
 */
export class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, Bucket>();
  private cleanup: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanup = setInterval(() => this.sweep(), 60_000);
    this.cleanup.unref();
  }

  hit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000),
      );
      return { allowed: false, retryAfterSeconds };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }

  sweep() {
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

let sharedStore: MemoryRateLimitStore | undefined;

export function rateLimit(options: {
  windowMs?: number;
  max?: number;
  scope: string;
}): MiddlewareHandler<AppEnv> {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 120;

  return async (c, next) => {
    if (process.env.NODE_ENV === 'test' && !process.env.FORCE_RATE_LIMIT) {
      await next();
      return;
    }
    sharedStore ??= new MemoryRateLimitStore();
    const key = `${options.scope}:${clientIp(c)}`;
    const result = sharedStore.hit(key, max, windowMs);
    if (!result.allowed) {
      c.header('Retry-After', String(result.retryAfterSeconds));
      throw ApiError.tooManyRequests(result.retryAfterSeconds);
    }
    await next();
  };
}
