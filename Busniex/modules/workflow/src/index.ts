import { Hono } from 'hono';
import type { ModuleDescriptor } from '@businex/types';
import type { BusinexDb } from '@businex/database';
import { workflowRouter } from './router';

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/workflows', workflowRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'workflow',
  name: 'Workflow Engine',
  description: 'Reusable state-machine workflow engine (draft/review/approval/... completing) for every document.',
  group: 'enterprise',
  permissions: ['workflow:read', 'workflow:write'],
  enabled: true,
};
