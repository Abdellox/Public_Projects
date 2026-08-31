import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb, schema, num, logActivity, type AuditContext } from "../index";
import type { MovementType } from "@supplyflow/types";

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];
export type Executor = ReturnType<typeof getDb> | Tx;

const SIGNED: Record<MovementType, 1 | -1> = {
  receipt: 1,
  transfer_in: 1,
  return_customer: 1,
  shipment: -1,
  transfer_out: -1,
  adjustment: 1,
  return_supplier: -1,
  damage: -1
};

/** Signed delta of a movement: quantity must be positive, direction comes from type. */
export function movementDelta(type: MovementType, quantity: number): number {
  if (!(quantity > 0) || !Number.isFinite(quantity)) throw badRequest("Movement quantity must be positive");
  return SIGNED[type] * quantity;
}

export interface MovementInput {
  productId: string;
  variantId?: string | null;
  warehouseId: string;
  locationId?: string | null;
  type: MovementType;
  quantity: number;
  unitCost?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  reason?: string | null;
}

/**
 * Apply a stock movement inside a transaction:
 * upserts the inventory row and writes the immutable movement record.
 * `quantity` is always positive; direction comes from movement type.
 */
export async function applyMovement(executor: Executor, ctx: AuditContext, input: MovementInput): Promise<void> {
  const delta = movementDelta(input.type, input.quantity);

  const existing = (await executor
    .select()
    .from(schema.inventory)
    .where(and(
      eq(schema.inventory.organizationId, ctx.organizationId),
      eq(schema.inventory.productId, input.productId),
      input.variantId ? eq(schema.inventory.variantId, input.variantId) : isNull(schema.inventory.variantId),
      eq(schema.inventory.warehouseId, input.warehouseId)
    ))
    .limit(1))[0];

  if (existing) {
    const newOnHand = num(String(existing.quantityOnHand)) + delta;
    if (newOnHand < -1e-9) throw badRequest("Insufficient stock for this movement");
    await executor
      .update(schema.inventory)
      .set({ quantityOnHand: newOnHand, updatedAt: new Date() })
      .where(eq(schema.inventory.id, existing.id));
  } else {
    if (delta < 0) throw badRequest("Cannot remove stock that does not exist");
    await executor.insert(schema.inventory).values({
      organizationId: ctx.organizationId,
      productId: input.productId,
      variantId: input.variantId ?? null,
      warehouseId: input.warehouseId,
      locationId: input.locationId ?? null,
      quantityOnHand: delta
    });
  }

  await executor.insert(schema.inventoryMovements).values({
    organizationId: ctx.organizationId,
    productId: input.productId,
    variantId: input.variantId ?? null,
    warehouseId: input.warehouseId,
    locationId: input.locationId ?? null,
    type: input.type,
    quantity: input.quantity,
    unitCost: input.unitCost ?? null,
    referenceType: input.referenceType ?? null,
    referenceId: input.referenceId ?? null,
    reason: input.reason ?? null,
    performedBy: ctx.userId ?? null
  });
}

export async function adjustInventory(executor: Executor, ctx: AuditContext, productId: string, warehouseId: string, type: "adjustment" | "damage" | "return_supplier", signedQuantity: number, reason?: string): Promise<void> {
  const type2 = type === "adjustment" ? (signedQuantity >= 0 ? "adjustment" : "adjustment") : type;
  await applyMovement(executor, ctx, {
    productId,
    warehouseId,
    type: type === "damage" ? "damage" : type === "return_supplier" ? "return_supplier" : "adjustment",
    quantity: Math.abs(signedQuantity),
    reason: reason ?? (type2 === "adjustment" ? "Manual correction" : undefined),
    referenceType: "manual"
  });
}

export async function reserveStock(executor: Executor, organizationId: string, productId: string, variantId: string | null, warehouseId: string, quantity: number): Promise<void> {
  if (quantity === 0) return;
  const row = (await executor
    .select()
    .from(schema.inventory)
    .where(and(
      eq(schema.inventory.organizationId, organizationId),
      eq(schema.inventory.productId, productId),
      variantId ? eq(schema.inventory.variantId, variantId) : isNull(schema.inventory.variantId),
      eq(schema.inventory.warehouseId, warehouseId)
    ))
    .limit(1))[0];

  const available = row ? num(String(row.quantityOnHand)) - num(String(row.reservedQuantity)) : 0;
  const nextReserved = (row ? num(String(row.reservedQuantity)) : 0) + quantity;
  if (nextReserved < 0 || quantity > available + 1e-9) {
    throw badRequest(`Insufficient unreserved stock to allocate ${quantity}`);
  }
  if (row) {
    await executor.update(schema.inventory).set({ reservedQuantity: nextReserved, updatedAt: new Date() }).where(eq(schema.inventory.id, row.id));
  } else {
    throw badRequest("No inventory record exists to reserve against");
  }
}

export async function releaseReservation(executor: Executor, organizationId: string, productId: string, variantId: string | null, warehouseId: string, quantity: number): Promise<void> {
  await executor
    .update(schema.inventory)
    .set({
      reservedQuantity: sql`GREATEST(${schema.inventory.reservedQuantity} - ${quantity}, 0)`,
      updatedAt: new Date()
    })
    .where(and(
      eq(schema.inventory.organizationId, organizationId),
      eq(schema.inventory.productId, productId),
      variantId ? eq(schema.inventory.variantId, variantId) : isNull(schema.inventory.variantId),
      eq(schema.inventory.warehouseId, warehouseId)
    ));
}

function badRequest(message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = 400;
  return err;
}
