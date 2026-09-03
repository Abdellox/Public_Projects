import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors } from '@businex/lib';
import { getIdentity, requirePermission } from '@businex/auth';
import { productSchema } from '@businex/validation';

/**
 * Catalog module — one canonical Product shared by Sales, POS, Inventory,
 * Procurement and Accounting (configuration is additive, not duplicated).
 */
export function catalogRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c).tenantId;

  app.get('/', requirePermission('product:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select({
        product: tables.product,
        config: tables.productConfig,
      })
      .from(tables.product)
      .leftJoin(tables.productConfig, eq(tables.productConfig.productId, tables.product.id))
      .where(eq(tables.product.tenantId, tenantId));
    return c.json(rows);
  });

  app.post('/', requirePermission('product:write'), async (c) => {
    const body = productSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const [existing] = await db
      .select()
      .from(tables.product)
      .where(and(eq(tables.product.tenantId, tenantId), eq(tables.product.code, body.code)));
    if (existing) throw Errors.conflict('Product code already exists');
    const [row] = await db.insert(tables.product).values({ ...body, tenantId }).returning();
    if (!row) throw Errors.internal('Failed to create product');
    await db.insert(tables.productConfig).values({
      tenantId,
      productId: row.id,
      isSellable: true,
      isStockable: body.kind === 'product',
      isService: body.kind === 'service',
    });
    return c.json(row, 201);
  });

  app.get('/:id', requirePermission('product:read'), async (c) => {
    const tenantId = tenantOf(c);
    const id = c.req.param('id')!;
    const [row] = await db
      .select({
        product: tables.product,
        config: tables.productConfig,
      })
      .from(tables.product)
      .leftJoin(tables.productConfig, eq(tables.productConfig.productId, tables.product.id))
      .where(and(eq(tables.product.id, id), eq(tables.product.tenantId, tenantId)));
    if (!row) throw Errors.notFound('Product not found');
    return c.json(row);
  });

  /** Price list endpoint (products + unit price). */
  app.get('/prices/:priceListId', requirePermission('product:read'), async (c) => {
    const tenantId = tenantOf(c);
    const priceListId = c.req.param('priceListId')!;
    const entries = await db
      .select({
        productCode: tables.product.code,
        productName: tables.product.name,
        price: tables.priceListEntry,
      })
      .from(tables.priceListEntry)
      .innerJoin(tables.product, eq(tables.product.id, tables.priceListEntry.productId))
      .where(
        and(
          eq(tables.priceListEntry.tenantId, tenantId),
          eq(tables.priceListEntry.priceListId, priceListId),
        ),
      );
    return c.json(entries);
  });

  return app;
}
