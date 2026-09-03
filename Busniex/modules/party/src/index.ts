import { Hono } from 'hono';
import type { ModuleDescriptor } from '@businex/types';
import type { BusinexDb } from '@businex/database';
import { partyRouter } from './router';

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/parties', partyRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'party',
  name: 'Parties',
  description: 'Canonical Party model with roles for customers, suppliers, partners, employees and more.',
  group: 'commercial',
  permissions: ['party:read', 'party:write'],
  enabled: true,
};
