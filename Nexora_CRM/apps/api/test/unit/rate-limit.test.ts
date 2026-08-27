import { describe, expect, it, vi } from 'vitest';
import { MemoryRateLimitStore } from '../../src/lib/rate-limit';

describe('MemoryRateLimitStore', () => {
  it('allows up to the limit then blocks within the window', () => {
    const store = new MemoryRateLimitStore();
    const key = 'auth:1.2.3.4';

    expect(store.hit(key, 2, 60_000).allowed).toBe(true);
    expect(store.hit(key, 2, 60_000).allowed).toBe(true);

    const blocked = store.hit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks keys independently', () => {
    const store = new MemoryRateLimitStore();
    store.hit('a', 1, 60_000);
    expect(store.hit('a', 1, 60_000).allowed).toBe(false);
    expect(store.hit('b', 1, 60_000).allowed).toBe(true);
  });

  it('resets after the window elapses', async () => {
    vi.useFakeTimers();
    try {
      const store = new MemoryRateLimitStore();
      const start = Date.now();
      vi.setSystemTime(start);

      expect(store.hit('k', 1, 50).allowed).toBe(true);
      expect(store.hit('k', 1, 50).allowed).toBe(false);

      vi.setSystemTime(start + 60);
      expect(store.hit('k', 1, 50).allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
