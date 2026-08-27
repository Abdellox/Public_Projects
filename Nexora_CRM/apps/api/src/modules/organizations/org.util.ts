import { DEFAULT_ROLES } from '@nexora/types';
import { slugify } from '@nexora/validation';
import { generateToken } from '@nexora/auth';

export { DEFAULT_ROLES };

export function slugifySafe(input: string): string {
  const base = slugify(input);
  if (base.length >= 3) return base;
  return `org-${generateToken(4).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}
