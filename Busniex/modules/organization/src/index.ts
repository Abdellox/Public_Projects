import { Hono } from 'hono';
import type { ModuleDescriptor } from '@businex/types';
import type { BusinexDb } from '@businex/database';
import { organizationRouter } from './router';

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/org', organizationRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'organization',
  name: 'Organization',
  description: 'Universal organization model: hierarchical org units, legal entities and locations.',
  group: 'enterprise',
  permissions: ['org:read', 'org:write'],
  enabled: true,
};
