import { eq } from 'drizzle-orm';
import { getDb, tables } from './index';
import { hashPassword } from '@businex/lib';

/**
 * Seed script for local development. Creates a demo tenant, organization
 * structure, a user, a couple of parties (customer/supplier), and sample
 * products so the modules have data to show.
 */
async function seed() {
  const db = getDb();

  const demoPassword = process.env.DEMO_PASSWORD ?? 'Demo1234!';

  // Tenant (idempotent)
  let tenantId: string;
  const existingTenant = await db
    .select()
    .from(tables.tenant)
    .where(eq(tables.tenant.slug, 'acme'))
    .limit(1);
  if (existingTenant[0]) {
    tenantId = existingTenant[0].id;
  } else {
    const [t] = await db
      .insert(tables.tenant)
      .values({ name: 'Acme Demo Corp', slug: 'acme' })
      .returning();
    if (!t) throw new Error('Could not create tenant');
    tenantId = t.id;
  }

  // Organization units
  const [hq] = await db
    .insert(tables.organizationUnit)
    .values({
      tenantId,
      type: 'legalEntity',
      code: 'ACME-LE',
      name: 'Acme Legal Entity',
    })
    .returning();

  const [warehouse] = await db
    .insert(tables.organizationUnit)
    .values({
      tenantId,
      type: 'warehouse',
      parentId: hq?.id,
      code: 'WH-MAIN',
      name: 'Main Warehouse',
    })
    .returning();

  const [loc] = await db
    .insert(tables.location)
    .values({
      tenantId,
      name: 'Main Warehouse',
      city: 'Springfield',
      region: 'IL',
      country: 'US',
      isWarehouse: true,
    })
    .returning();
  if (!loc) throw new Error('Could not create location');

  // Parties with roles
  const [customer] = await db
    .insert(tables.party)
    .values({ tenantId, kind: 'organization', name: 'Globex Corporation' })
    .returning();
  if (customer) {
    await db.insert(tables.partyRole).values({ tenantId, partyId: customer.id, roleType: 'customer' });
  }

  const [supplier] = await db
    .insert(tables.party)
    .values({ tenantId, kind: 'organization', name: 'Initech Materials' })
    .returning();
  if (supplier) {
    await db.insert(tables.partyRole).values({ tenantId, partyId: supplier.id, roleType: 'supplier' });
  }

  // Products
  const products = [
    { code: 'PROD-1001', name: 'Widget', kind: 'product', isStockable: true },
    { code: 'PROD-1002', name: 'Gadget', kind: 'product', isStockable: true },
    { code: 'SVC-2001', name: 'Consulting Hour', kind: 'service', isStockable: false },
  ];
  for (const p of products) {
    const exists = await db
      .select()
      .from(tables.product)
      .where(eq(tables.product.code, p.code))
      .limit(1);
    const row =
      exists[0] ??
      (
        await db
          .insert(tables.product)
          .values({ tenantId, code: p.code, name: p.name, kind: p.kind as 'product' | 'service' })
          .returning()
      )[0];
    if (!row) continue;
    await db.insert(tables.productConfig).values({
      tenantId,
      productId: row.id,
      isSellable: true,
      isStockable: p.isStockable,
      isService: p.kind === 'service',
    });
    if (p.isStockable) {
      await db.insert(tables.inventoryItem).values({
        tenantId,
        productId: row.id,
        locationId: loc.id,
        quantityOnHand: '100',
        reservedQuantity: '0',
        availableQuantity: '100',
      });
    }
  }

  // User (idempotent)
  const existingUser = await db
    .select()
    .from(tables.user)
    .where(eq(tables.user.email, 'admin@businex.dev'))
    .limit(1);
  let admin = existingUser[0];
  if (!admin) {
    const [created] = await db
      .insert(tables.user)
      .values({
        tenantId,
        email: 'admin@businex.dev',
        passwordHash: hashPassword(demoPassword),
        displayName: 'Admin User',
      })
      .returning();
    admin = created ?? undefined;
  }
  if (admin) {
    const existingRole = await db
      .select()
      .from(tables.role)
      .where(eq(tables.role.name, 'Admin'))
      .limit(1);
    const role =
      existingRole[0] ??
      (
        await db
          .insert(tables.role)
          .values({ tenantId, name: 'Admin', permissions: ['*'] })
          .returning()
      )[0];
    if (role) {
      await db.insert(tables.userRole).values({ tenantId, userId: admin.id, roleId: role.id });
    }
  }

  // Roles for navigation
  const roles = [
    { name: 'Sales Rep', permissions: ['quote:create', 'quote:read', 'opportunity:*'] },
    { name: 'Accountant', permissions: ['invoice:*', 'payment:*'] },
    { name: 'Warehouse', permissions: ['inventory:*', 'stock:*'] },
  ];
  for (const role of roles) {
    const exists = await db
      .select()
      .from(tables.role)
      .where(eq(tables.role.name, role.name))
      .limit(1);
    if (!exists[0]) {
      await db.insert(tables.role).values({ tenantId, name: role.name, permissions: role.permissions });
    }
  }

  // A default workflow for invoices (small business: draft -> completed)
  const wf = await db
    .select()
    .from(tables.workflowDefinition)
    .where(eq(tables.workflowDefinition.name, 'Simple Invoice'))
    .limit(1);
  if (!wf[0]) {
    await db.insert(tables.workflowDefinition).values({
      tenantId,
      name: 'Simple Invoice',
      appliesTo: 'invoice',
      transitions: [
        { from: 'draft', to: 'completed' },
        { from: 'completed', to: 'cancelled' },
      ],
      isActive: true,
    });
  }

  console.log(`Seeded tenant 'acme' with demo data.`);
  console.log(`  Admin login: admin@businex.dev / ${demoPassword}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
