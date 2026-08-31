import { z } from "zod";

const optionalText = z.string().trim().max(2000).optional().nullable();
const money = z.number().min(-1e12).max(1e12).finite();
const qty = z.number().min(0).max(1e9).finite();

export const idSchema = z.string().uuid();

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100)
});

/* Auth */
export const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128)
});

export const createOrgSchema = z.object({
  name: z.string().trim().min(2).max(160),
  currency: z.string().trim().length(3).default("USD"),
  timezone: z.string().trim().max(60).default("UTC")
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email().max(255),
  name: z.string().trim().min(1).max(120),
  role: z.enum(["admin", "manager", "buyer", "planner", "viewer"]),
  temporaryPassword: z.string().min(8).max(128)
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["owner", "admin", "manager", "buyer", "planner", "viewer"])
});

/* Catalog */
export const productCreateSchema = z.object({
  sku: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(200),
  description: optionalText,
  categoryId: idSchema.optional().nullable(),
  primarySupplierId: idSchema.optional().nullable(),
  unit: z.string().trim().max(24).default("unit"),
  barcode: optionalText,
  costPrice: money.optional().nullable(),
  sellingPrice: money.optional().nullable(),
  minStock: qty.default(0),
  maxStock: qty.optional().nullable(),
  reorderPoint: qty.optional().nullable(),
  reorderQuantity: qty.optional().nullable(),
  leadTimeDays: z.coerce.number().int().min(0).max(365).optional().nullable(),
  defaultWarehouseId: idSchema.optional().nullable()
});
export const productUpdateSchema = productCreateSchema.partial();

export const supplierCreateSchema = z.object({
  code: optionalText,
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  phone: optionalText,
  website: optionalText,
  addressLine1: optionalText,
  city: optionalText,
  country: optionalText,
  taxId: optionalText,
  paymentTerms: optionalText,
  currency: optionalText,
  defaultLeadTimeDays: z.coerce.number().int().min(0).max(365).optional().nullable(),
  notes: optionalText
});
export const supplierUpdateSchema = supplierCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  color: optionalText,
  parentId: idSchema.optional().nullable()
});

/* Warehouses & inventory */
export const warehouseCreateSchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(160),
  addressLine1: optionalText,
  city: optionalText,
  country: optionalText,
  isDefault: z.boolean().default(false)
});
export const warehouseUpdateSchema = warehouseCreateSchema.partial();

export const movementTypeSchema = z.enum(["receipt", "shipment", "transfer_in", "transfer_out", "adjustment", "return_customer", "return_supplier", "damage"]);

export const inventoryAdjustSchema = z.object({
  productId: idSchema,
  warehouseId: idSchema,
  type: z.enum(["adjustment", "damage", "return_supplier"]),
  quantity: z.number().refine((v) => v !== 0, "Quantity must not be zero"),
  reason: z.string().trim().max(500).optional()
});

export const transferCreateSchema = z.object({
  fromWarehouseId: idSchema,
  toWarehouseId: idSchema,
  lines: z.array(z.object({ productId: idSchema, quantity: z.number().positive() })).min(1).max(200),
  notes: optionalText
}).refine((d) => d.fromWarehouseId !== d.toWarehouseId, { message: "Source and destination warehouses must differ" });

/* Purchasing */
export const poStatusValues = ["draft", "sent", "confirmed", "partially_received", "received", "cancelled"] as const;

export const poLineInputSchema = z.object({
  productId: idSchema,
  quantity: z.number().positive().max(1e9),
  unitCost: money.min(0).default(0),
  discountPercent: z.number().min(0).max(100).default(0)
});

export const poCreateSchema = z.object({
  number: z.string().trim().min(1).max(40).optional(),
  supplierId: idSchema,
  warehouseId: idSchema.optional().nullable(),
  orderDate: z.string().date().optional().nullable(),
  expectedDate: z.string().date().optional().nullable(),
  notes: optionalText,
  status: z.enum(poStatusValues).default("draft"),
  lines: z.array(poLineInputSchema).min(1).max(500)
});
export const poUpdateSchema = z.object({
  supplierId: idSchema.optional(),
  warehouseId: idSchema.optional().nullable(),
  orderDate: z.string().date().optional().nullable(),
  expectedDate: z.string().date().optional().nullable(),
  notes: optionalText,
  status: z.enum(poStatusValues).optional(),
  lines: z.array(poLineInputSchema).min(1).max(500).optional()
});

/* Inbound shipments */
export const shipmentStatusValues = ["pending", "in_transit", "arrived", "completed", "cancelled"] as const;

export const inboundShipmentCreateSchema = z.object({
  number: z.string().trim().min(1).max(40).optional(),
  purchaseOrderId: idSchema.optional().nullable(),
  supplierId: idSchema,
  warehouseId: idSchema.optional().nullable(),
  carrier: optionalText,
  trackingNumber: optionalText,
  origin: optionalText,
  departedAt: z.string().datetime().optional().nullable(),
  expectedArrival: z.string().datetime().optional().nullable(),
  status: z.enum(shipmentStatusValues).default("pending"),
  notes: optionalText,
  lines: z.array(z.object({
    productId: idSchema,
    quantityExpected: z.number().nonnegative().max(1e9),
    purchaseOrderLineId: idSchema.optional().nullable()
  })).min(1).max(500)
});
export const inboundShipmentUpdateSchema = inboundShipmentCreateSchema.partial();

export const receiveShipmentSchema = z.object({
  lines: z.array(z.object({
    lineId: idSchema,
    quantityReceived: z.number().nonnegative().max(1e9)
  })).min(1)
});

/* Sales */
export const customerOrderStatusValues = ["draft", "confirmed", "processing", "partially_shipped", "shipped", "delivered", "cancelled"] as const;
export const outboundStatusValues = ["pending", "picking", "packed", "shipped", "delivered", "cancelled"] as const;

export const customerCreateSchema = z.object({
  code: optionalText,
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  phone: optionalText,
  addressLine1: optionalText,
  city: optionalText,
  country: optionalText,
  paymentTerms: optionalText,
  notes: optionalText
});
export const customerUpdateSchema = customerCreateSchema.partial();

export const coLineInputSchema = z.object({
  productId: idSchema,
  quantity: z.number().positive().max(1e9),
  unitPrice: money.min(0).default(0),
  discountPercent: z.number().min(0).max(100).default(0)
});

export const customerOrderCreateSchema = z.object({
  number: z.string().trim().min(1).max(40).optional(),
  customerId: idSchema,
  warehouseId: idSchema.optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  orderDate: z.string().date().optional().nullable(),
  requiredDate: z.string().date().optional().nullable(),
  notes: optionalText,
  status: z.enum(customerOrderStatusValues).default("draft"),
  lines: z.array(coLineInputSchema).min(1).max(500)
});
export const customerOrderUpdateSchema = customerOrderCreateSchema.partial();

export const outboundShipmentCreateSchema = z.object({
  number: z.string().trim().min(1).max(40).optional(),
  customerOrderId: idSchema.optional().nullable(),
  customerId: idSchema.optional().nullable(),
  warehouseId: idSchema.optional().nullable(),
  carrier: optionalText,
  trackingNumber: optionalText,
  expectedDelivery: z.string().datetime().optional().nullable(),
  status: z.enum(outboundStatusValues).default("pending"),
  notes: optionalText,
  lines: z.array(z.object({
    productId: idSchema,
    quantity: z.number().positive().max(1e9),
    customerOrderLineId: idSchema.optional().nullable()
  })).min(1).max(500)
});
export const outboundShipmentUpdateSchema = outboundShipmentCreateSchema.partial();

export const shipOutboundSchema = z.object({
  shippedAt: z.string().datetime().optional()
});

export const deliverOutboundSchema = z.object({
  actualDelivery: z.string().datetime().optional()
});

/* Planning */
export const forecastCreateSchema = z.object({
  productId: idSchema,
  warehouseId: idSchema.optional().nullable(),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  quantity: z.number().nonnegative().max(1e9),
  source: z.enum(["manual", "historical", "import", "order_based"]).default("manual"),
  note: optionalText
});

/* Collaboration */
export const commentCreateSchema = z.object({
  entityType: z.enum(["product", "supplier", "purchase_order", "inbound_shipment", "customer_order", "outbound_shipment", "warehouse", "inventory"]),
  entityId: idSchema,
  body: z.string().trim().min(1).max(4000),
  mentions: z.array(idSchema).max(20).default([])
});

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: optionalText,
  assigneeId: idSchema.optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().date().optional().nullable(),
  entityType: optionalText,
  entityId: idSchema.optional().nullable()
});
export const taskUpdateSchema = taskCreateSchema.partial().extend({
  status: z.enum(["open", "in_progress", "done", "cancelled"]).optional()
});

/* Import */
export const importMappingSchema = z.object({
  entity: z.enum(["products", "suppliers", "inventory", "customers"]),
  mappings: z.record(z.string(), z.string()),
  mode: z.enum(["upsert", "create_only"]).default("upsert")
});

export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
    const err = new Error(`Validation failed — ${issues}`) as Error & { status?: number; issues?: unknown };
    err.status = 400;
    err.issues = result.error.issues;
    throw err;
  }
  return result.data;
}
