import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ModuleDescriptor } from '@businex/types';
import { env } from '@businex/config';
import { getDb } from '@businex/database';
import { AppError, Errors } from '@businex/lib';
import { requireAuth } from '@businex/auth';

// Module registrars
import { register as registerIdentity, descriptor as identityModule } from '@businex/module-identity';
import { register as registerOrganization, descriptor as organizationModule } from '@businex/module-organization';
import { register as registerParty, descriptor as partyModule } from '@businex/module-party';
import { register as registerCatalog, descriptor as catalogModule } from '@businex/module-catalog';
import { register as registerWorkflow, descriptor as workflowModule } from '@businex/module-workflow';
import { register as registerAudit, descriptor as auditModule } from '@businex/module-audit';
import { register as registerNotification, descriptor as notificationModule } from '@businex/module-notification';
import { register as registerDocument, descriptor as documentModule } from '@businex/module-document';
import { register as registerCrm, descriptor as crmModule } from '@businex/module-crm';
import { register as registerInvoicing, descriptor as invoicingModule } from '@businex/module-invoicing';
import { register as registerInventory, descriptor as inventoryModule } from '@businex/module-inventory';
import { register as registerPos, descriptor as posModule } from '@businex/module-pos';

const app = new Hono<{ Variables: { identity?: unknown } }>();

app.use(
  '*',
  cors({
    origin: env.webOrigins,
    credentials: true,
  }),
);

const db = getDb();

const modules: ModuleDescriptor[] = [
  identityModule,
  organizationModule,
  partyModule,
  catalogModule,
  workflowModule,
  auditModule,
  notificationModule,
  documentModule,
  crmModule,
  invoicingModule,
  inventoryModule,
  posModule,
];

// Health + discovery
app.get('/health', (c) => c.json({ status: 'ok', service: 'businex-api' }));
app.get('/modules', (c) =>
  c.json({ modules: modules.filter((m) => m.enabled).map((m) => m.id) }),
);

// Register platform + domain module routes (identity/auth is open; the rest require a token).
registerIdentity(db, app);
app.use('/org', requireAuth);
app.use('/parties', requireAuth);
app.use('/products', requireAuth);
app.use('/workflows', requireAuth);
app.use('/audit', requireAuth);
app.use('/notifications', requireAuth);
app.use('/documents', requireAuth);
app.use('/crm', requireAuth);
app.use('/invoices', requireAuth);
app.use('/inventory', requireAuth);
app.use('/pos', requireAuth);

registerOrganization(db, app);
registerParty(db, app);
registerCatalog(db, app);
registerWorkflow(db, app);
registerAudit(db, app);
registerNotification(db, app);
registerDocument(db, app);
registerCrm(db, app);
registerInvoicing(db, app);
registerInventory(db, app);
registerPos(db, app);

// Central error handler
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: { code: err.code, message: err.message, details: err.details } }, err.statusCode as ContentfulStatusCode);
  }
  console.error(err);
  return c.json({ error: { code: 'INTERNAL', message: 'Internal server error' } }, 500);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = await import('@hono/node-server');
  server.serve({ fetch: app.fetch, port: env.apiPort });
  console.log(`BUSINEX API listening on :${env.apiPort}`);
}

export default app;
export { modules };
