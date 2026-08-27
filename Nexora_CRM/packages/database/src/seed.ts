import './env';
import { eq } from 'drizzle-orm';
import {
  departments,
  organizations,
  organizationMemberships,
  permissions,
  rolePermissions,
  roles,
  teams,
  users,
} from './schema';
import { createDb } from './client';
import { hashPassword } from '@nexora/auth';
import { DEFAULT_ROLES, PERMISSIONS } from '@nexora/types';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const { db, pool } = createDb(url);

  console.log('Seeding permission catalog…');
  for (const p of PERMISSIONS) {
    await db
      .insert(permissions)
      .values({ key: p.key, description: p.description })
      .onConflictDoNothing();
  }

  const demoEmail = 'demo-owner@nexora.local';
  const demoPassword = process.env.DEMO_PASSWORD ?? 'Demo1234!';

  let [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, 'nexora-demo'));

  if (!org) {
    console.log('Creating demo organization…');
    let [demoUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, demoEmail));

    if (!demoUser) {
      [demoUser] = await db
        .insert(users)
        .values({
          email: demoEmail,
          name: 'Demo Owner',
          jobTitle: 'Founder',
          passwordHash: await hashPassword(demoPassword),
        })
        .returning();
      console.log(`Created demo user: ${demoEmail}`);
    }
    const owner = demoUser!;

    [org] = await db
      .insert(organizations)
      .values({
        name: 'Nexora Demo',
        slug: 'nexora-demo',
        createdByUserId: owner.id,
        settings: { seeded: true },
      })
      .returning();

    for (const template of DEFAULT_ROLES) {
      const [role] = await db
        .insert(roles)
        .values({
          organizationId: org!.id,
          key: template.key,
          name: template.name,
          description: template.description,
          isSystem: true,
        })
        .returning();

      if (role && template.permissions.length > 0) {
        await db.insert(rolePermissions).values(
          template.permissions.map((permissionKey) => ({
            roleId: role.id,
            permissionKey,
          })),
        );
      }
    }

    const roleRows = await db
      .select()
      .from(roles)
      .where(eq(roles.organizationId, org!.id));
    const ownerRole = roleRows.find((r) => r.key === 'owner')!;

    await db.insert(organizationMemberships).values({
      organizationId: org!.id,
      userId: owner.id,
      roleId: ownerRole.id,
      jobTitle: 'Founder',
    });

    const [sales] = await db
      .insert(departments)
      .values({ organizationId: org!.id, name: 'Sales' })
      .onConflictDoNothing()
      .returning();
    const [engineering] = await db
      .insert(departments)
      .values({ organizationId: org!.id, name: 'Engineering' })
      .onConflictDoNothing()
      .returning();

    if (sales) {
      await db
        .insert(teams)
        .values({
          organizationId: org!.id,
          departmentId: sales.id,
          name: 'Inside Sales',
        })
        .onConflictDoNothing();
    }
    if (engineering) {
      await db
        .insert(teams)
        .values({
          organizationId: org!.id,
          departmentId: engineering.id,
          name: 'Platform',
        })
        .onConflictDoNothing();
    }

    const createdOrg = org!;
    console.log(`Demo organization ready: ${createdOrg.name} (${createdOrg.slug})`);
    console.log(`Login: ${demoEmail} / ${demoPassword}`);
  } else {
    console.log('Demo organization already exists — skipping.');
  }

  await pool.end();
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

