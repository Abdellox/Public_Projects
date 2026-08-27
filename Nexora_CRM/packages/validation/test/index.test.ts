import { describe, expect, it } from 'vitest';
import {
  createOrganizationSchema,
  loginSchema,
  paginationQuerySchema,
  registerSchema,
  slugify,
} from '../src';

describe('slugify', () => {
  it('produces lowercase hyphenated slugs', () => {
    expect(slugify('Acme Corporation!')).toBe('acme-corporation');
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    expect(slugify('Ünïcödé Çity')).toBe('unicode-city');
    expect(slugify('--weird--name--')).toBe('weird-name');
  });
});

describe('registerSchema', () => {
  it('normalizes the email', () => {
    const result = registerSchema.parse({
      name: 'Ada Lovelace',
      email: '  Ada@Example.COM ',
      password: 'Sup3rSecret!',
    });
    expect(result.email).toBe('ada@example.com');
  });

  it('rejects weak passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'alllowercase1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'Ab1x',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('lowercases emails for consistent lookups', () => {
    const result = loginSchema.parse({ email: 'USER@Site.com', password: 'x' });
    expect(result.email).toBe('user@site.com');
  });
});

describe('createOrganizationSchema', () => {
  it('accepts an explicit valid slug', () => {
    const result = createOrganizationSchema.parse({ name: 'Acme', slug: 'acme-inc' });
    expect(result.slug).toBe('acme-inc');
  });

  it('rejects invalid slugs', () => {
    const result = createOrganizationSchema.safeParse({
      name: 'Acme',
      slug: 'Not A Slug',
    });
    expect(result.success).toBe(false);
  });
});

describe('paginationQuerySchema', () => {
  it('applies defaults and coerces strings', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ limit: 25, offset: 0 });
    expect(paginationQuerySchema.parse({ limit: '50', offset: '10' })).toEqual({
      limit: 50,
      offset: 10,
    });
  });

  it('rejects out-of-range values instead of clamping silently', () => {
    expect(paginationQuerySchema.safeParse({ limit: '1000' }).success).toBe(false);
    expect(paginationQuerySchema.safeParse({ offset: -1 }).success).toBe(false);
  });
});
