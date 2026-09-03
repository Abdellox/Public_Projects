import { Hono } from 'hono';
import type { ModuleDescriptor } from '@businex/types';
import type { BusinexDb } from '@businex/database';
import { catalogRouter } from './router';

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/products', catalogRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'catalog',
  name: 'Catalog',
  description: 'Universal product catalog shared by sales, POS, inventory, procurement and accounting.',
  group: 'commercial',
  permissions: ['product:read', 'product:write'],
  enabled: true,
};
