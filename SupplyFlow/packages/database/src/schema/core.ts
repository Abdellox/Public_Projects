import { pgEnum, pgTable, text, timestamp, uuid, boolean, index, uniqueIndex, jsonb, integer, numeric, doublePrecision, date } from "drizzle-orm/pg-core";

export const membershipRole = pgEnum("membership_role", ["owner", "admin", "manager", "buyer", "planner", "viewer"]);
export const entityStatus = pgEnum("entity_status", ["active", "inactive", "archived"]);
export const poStatus = pgEnum("po_status", ["draft", "sent", "confirmed", "partially_received", "received", "cancelled"]);
export const shipmentStatus = pgEnum("shipment_status", ["pending", "in_transit", "arrived", "completed", "cancelled"]);
export const customerOrderStatus = pgEnum("customer_order_status", ["draft", "confirmed", "processing", "partially_shipped", "shipped", "delivered", "cancelled"]);
export const outboundStatus = pgEnum("outbound_status", ["pending", "picking", "packed", "shipped", "delivered", "cancelled"]);
export const movementType = pgEnum("movement_type", ["receipt", "shipment", "transfer_in", "transfer_out", "adjustment", "return_customer", "return_supplier", "damage"]);
export const taskStatus = pgEnum("task_status", ["open", "in_progress", "done", "cancelled"]);
export const priority = pgEnum("priority", ["low", "medium", "high", "urgent"]);
export const forecastSource = pgEnum("forecast_source", ["manual", "historical", "import", "order_based"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
};

const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true })
};

/* ── Tenancy & identity ─────────────────────────────────────────── */

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  currency: text("currency").notNull().default("USD"),
  timezone: text("timezone").notNull().default("UTC"),
  plan: text("plan").notNull().default("oss"),
  ...timestamps
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  mfaSecret: text("mfa_secret"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps
});

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: membershipRole("role").notNull().default("viewer"),
  ...timestamps
}, (t) => [uniqueIndex("memberships_org_user_idx").on(t.organizationId, t.userId)]);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

/* ── Catalog ────────────────────────────────────────────────────── */

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  parentId: uuid("parent_id"),
  color: text("color"),
  ...timestamps
}, (t) => [index("categories_org_idx").on(t.organizationId)]);

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  code: text("code"),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  addressLine1: text("address_line1"),
  city: text("city"),
  country: text("country"),
  taxId: text("tax_id"),
  paymentTerms: text("payment_terms").default("NET30"),
  currency: text("currency"),
  defaultLeadTimeDays: integer("default_lead_time_days").default(14),
  notes: text("notes"),
  status: entityStatus("status").notNull().default("active"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  ...timestamps,
  ...softDelete
}, (t) => [index("suppliers_org_idx").on(t.organizationId), index("suppliers_name_idx").on(t.name)]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  primarySupplierId: uuid("primary_supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  unit: text("unit").notNull().default("unit"),
  barcode: text("barcode"),
  costPrice: numeric("cost_price", { precision: 14, scale: 2 }),
  sellingPrice: numeric("selling_price", { precision: 14, scale: 2 }),
  minStock: doublePrecision("min_stock").notNull().default(0),
  maxStock: doublePrecision("max_stock"),
  reorderPoint: doublePrecision("reorder_point"),
  reorderQuantity: doublePrecision("reorder_quantity"),
  leadTimeDays: integer("lead_time_days").default(14),
  defaultWarehouseId: uuid("default_warehouse_id"),
  status: entityStatus("status").notNull().default("active"),
  customAttributes: jsonb("custom_attributes").$type<Record<string, unknown>>().notNull().default({}),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  ...timestamps,
  ...softDelete
}, (t) => [
  uniqueIndex("products_org_sku_idx").on(t.organizationId, t.sku),
  index("products_org_idx").on(t.organizationId),
  index("products_name_idx").on(t.name)
]);

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  attributes: jsonb("attributes").$type<Record<string, string>>().notNull().default({}),
  barcode: text("barcode"),
  costPrice: numeric("cost_price", { precision: 14, scale: 2 }),
  sellingPrice: numeric("selling_price", { precision: 14, scale: 2 }),
  status: entityStatus("status").notNull().default("active"),
  ...timestamps,
  ...softDelete
}, (t) => [uniqueIndex("variants_org_sku_idx").on(t.organizationId, t.sku), index("variants_product_idx").on(t.productId)]);

/* ── Warehouses & inventory ─────────────────────────────────────── */

export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  addressLine1: text("address_line1"),
  city: text("city"),
  country: text("country"),
  isDefault: boolean("is_default").notNull().default(false),
  ...timestamps,
  ...softDelete
}, (t) => [index("warehouses_org_idx").on(t.organizationId), uniqueIndex("warehouses_org_code_idx").on(t.organizationId, t.code)]);

export const warehouseLocations = pgTable("warehouse_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  description: text("description"),
  ...timestamps
}, (t) => [uniqueIndex("locations_wh_code_idx").on(t.warehouseId, t.code)]);

export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id, { onDelete: "cascade" }),
  locationId: uuid("location_id").references(() => warehouseLocations.id, { onDelete: "set null" }),
  quantityOnHand: doublePrecision("quantity_on_hand").notNull().default(0),
  reservedQuantity: doublePrecision("reserved_quantity").notNull().default(0),
  damagedQuantity: doublePrecision("damaged_quantity").notNull().default(0),
  ...timestamps
}, (t) => [
  uniqueIndex("inventory_unique_idx").on(t.organizationId, t.productId, t.variantId, t.warehouseId),
  index("inventory_product_idx").on(t.productId)
]);

export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id, { onDelete: "cascade" }),
  locationId: uuid("location_id").references(() => warehouseLocations.id, { onDelete: "set null" }),
  type: movementType("type").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 14, scale: 2 }),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  reason: text("reason"),
  performedBy: uuid("performed_by").references(() => users.id, { onDelete: "set null" }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("movements_org_time_idx").on(t.organizationId, t.occurredAt), index("movements_product_idx").on(t.productId)]);

/* ── Purchasing ─────────────────────────────────────────────────── */

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "restrict" }),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id, { onDelete: "set null" }),
  status: poStatus("status").notNull().default("draft"),
  currency: text("currency").notNull().default("USD"),
  orderDate: date("order_date"),
  expectedDate: date("expected_date"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  buyerId: uuid("buyer_id").references(() => users.id, { onDelete: "set null" }),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  ...timestamps,
  ...softDelete
}, (t) => [uniqueIndex("po_org_number_idx").on(t.organizationId, t.number), index("po_supplier_idx").on(t.supplierId), index("po_status_idx").on(t.status)]);

export const purchaseOrderLines = pgTable("purchase_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  purchaseOrderId: uuid("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
  lineNo: integer("line_no").notNull().default(1),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  quantity: doublePrecision("quantity").notNull().default(0),
  quantityReceived: doublePrecision("quantity_received").notNull().default(0),
  unitCost: numeric("unit_cost", { precision: 14, scale: 2 }).notNull().default("0"),
  discountPercent: doublePrecision("discount_percent").notNull().default(0),
  total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
  ...timestamps
}, (t) => [index("pol_po_idx").on(t.purchaseOrderId), index("pol_product_idx").on(t.productId)]);

export const inboundShipments = pgTable("inbound_shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id, { onDelete: "set null" }),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "restrict" }),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id, { onDelete: "set null" }),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  origin: text("origin"),
  expectedArrival: timestamp("expected_arrival", { withTimezone: true }),
  actualArrival: timestamp("actual_arrival", { withTimezone: true }),
  departedAt: timestamp("departed_at", { withTimezone: true }),
  status: shipmentStatus("status").notNull().default("pending"),
  notes: text("notes"),
  ...timestamps,
  ...softDelete
}, (t) => [uniqueIndex("ibs_org_number_idx").on(t.organizationId, t.number), index("ibs_po_idx").on(t.purchaseOrderId), index("ibs_expected_idx").on(t.expectedArrival)]);

export const inboundShipmentLines = pgTable("inbound_shipment_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  shipmentId: uuid("shipment_id").notNull().references(() => inboundShipments.id, { onDelete: "cascade" }),
  purchaseOrderLineId: uuid("purchase_order_line_id").references(() => purchaseOrderLines.id, { onDelete: "set null" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  quantityExpected: doublePrecision("quantity_expected").notNull().default(0),
  quantityReceived: doublePrecision("quantity_received").notNull().default(0),
  ...timestamps
}, (t) => [index("ibsl_shipment_idx").on(t.shipmentId), index("ibsl_product_idx").on(t.productId)]);

/* ── Sales ──────────────────────────────────────────────────────── */

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  code: text("code"),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  city: text("city"),
  country: text("country"),
  paymentTerms: text("payment_terms").default("NET30"),
  notes: text("notes"),
  status: entityStatus("status").notNull().default("active"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  ...timestamps,
  ...softDelete
}, (t) => [index("customers_org_idx").on(t.organizationId), index("customers_name_idx").on(t.name)]);

export const customerOrders = pgTable("customer_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "restrict" }),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id, { onDelete: "set null" }),
  status: customerOrderStatus("status").notNull().default("draft"),
  priority: priority("priority").notNull().default("medium"),
  currency: text("currency").notNull().default("USD"),
  orderDate: date("order_date"),
  requiredDate: date("required_date"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
  salespersonId: uuid("salesperson_id").references(() => users.id, { onDelete: "set null" }),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  ...timestamps,
  ...softDelete
}, (t) => [uniqueIndex("co_org_number_idx").on(t.organizationId, t.number), index("co_customer_idx").on(t.customerId), index("co_status_idx").on(t.status), index("co_required_date_idx").on(t.requiredDate)]);

export const customerOrderLines = pgTable("customer_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  customerOrderId: uuid("customer_order_id").notNull().references(() => customerOrders.id, { onDelete: "cascade" }),
  lineNo: integer("line_no").notNull().default(1),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  quantity: doublePrecision("quantity").notNull().default(0),
  quantityShipped: doublePrecision("quantity_shipped").notNull().default(0),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull().default("0"),
  discountPercent: doublePrecision("discount_percent").notNull().default(0),
  total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
  ...timestamps
}, (t) => [index("col_order_idx").on(t.customerOrderId), index("col_product_idx").on(t.productId)]);

export const outboundShipments = pgTable("outbound_shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  customerOrderId: uuid("customer_order_id").references(() => customerOrders.id, { onDelete: "set null" }),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id, { onDelete: "set null" }),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  expectedDelivery: timestamp("expected_delivery", { withTimezone: true }),
  actualDelivery: timestamp("actual_delivery", { withTimezone: true }),
  status: outboundStatus("status").notNull().default("pending"),
  notes: text("notes"),
  ...timestamps,
  ...softDelete
}, (t) => [uniqueIndex("obs_org_number_idx").on(t.organizationId, t.number), index("obs_co_idx").on(t.customerOrderId), index("obs_expected_idx").on(t.expectedDelivery)]);

export const outboundShipmentLines = pgTable("outbound_shipment_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  shipmentId: uuid("shipment_id").notNull().references(() => outboundShipments.id, { onDelete: "cascade" }),
  customerOrderLineId: uuid("customer_order_line_id").references(() => customerOrderLines.id, { onDelete: "set null" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  quantity: doublePrecision("quantity").notNull().default(0),
  ...timestamps
}, (t) => [index("obsl_shipment_idx").on(t.shipmentId), index("obsl_product_idx").on(t.productId)]);

/* ── Planning ───────────────────────────────────────────────────── */

export const demandForecasts = pgTable("demand_forecasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id, { onDelete: "set null" }),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  quantity: doublePrecision("quantity").notNull().default(0),
  source: forecastSource("source").notNull().default("manual"),
  note: text("note"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps
}, (t) => [index("forecast_org_product_idx").on(t.organizationId, t.productId), index("forecast_period_idx").on(t.periodStart)]);

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  fromWarehouseId: uuid("from_warehouse_id").notNull().references(() => warehouses.id, { onDelete: "restrict" }),
  toWarehouseId: uuid("to_warehouse_id").notNull().references(() => warehouses.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("draft"),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
  ...softDelete
}, (t) => [uniqueIndex("tr_org_number_idx").on(t.organizationId, t.number)]);

export const transferLines = pgTable("transfer_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  transferId: uuid("transfer_id").notNull().references(() => transfers.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  quantity: doublePrecision("quantity").notNull().default(0),
  quantityShipped: doublePrecision("quantity_shipped").notNull().default(0),
  quantityReceived: doublePrecision("quantity_received").notNull().default(0),
  ...timestamps
}, (t) => [index("trl_transfer_idx").on(t.transferId)]);

/* ── Collaboration ──────────────────────────────────────────────── */

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  summary: text("summary"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("activities_entity_idx").on(t.entityType, t.entityId), index("activities_org_time_idx").on(t.organizationId, t.createdAt)]);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  mentions: jsonb("mentions").$type<string[]>().notNull().default([]),
  editedAt: timestamp("edited_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  ...timestamps
}, (t) => [index("comments_entity_idx").on(t.entityType, t.entityId)]);

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
  status: taskStatus("status").notNull().default("open"),
  priority: priority("priority").notNull().default("medium"),
  dueDate: date("due_date"),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps
}, (t) => [index("tasks_org_status_idx").on(t.organizationId, t.status), index("tasks_assignee_idx").on(t.assigneeId)]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("notifications_user_idx").on(t.userId, t.readAt)]);

/* ── Documents ──────────────────────────────────────────────────── */

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  storageKey: text("storage_key").notNull(),
  uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
  ...timestamps
}, (t) => [index("documents_entity_idx").on(t.entityType, t.entityId)]);

/* ── Custom tables (safe customization layer) ───────────────────── */

export const customTables = pgTable("custom_tables", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  icon: text("icon").default("table"),
  ...timestamps,
  ...softDelete
}, (t) => [uniqueIndex("ct_org_slug_idx").on(t.organizationId, t.slug)]);

export const customColumns = pgTable("custom_columns", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tableId: uuid("table_id").notNull().references(() => customTables.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull().default("text"),
  options: jsonb("options").$type<string[]>(),
  required: boolean("required").notNull().default(false),
  position: integer("position").notNull().default(0),
  ...timestamps
}, (t) => [uniqueIndex("cc_table_key_idx").on(t.tableId, t.key)]);

export const customRecords = pgTable("custom_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tableId: uuid("table_id").notNull().references(() => customTables.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
  createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
  ...softDelete
}, (t) => [index("cr_table_idx").on(t.tableId)]);

/* ── Audit ──────────────────────────────────────────────────────── */

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("audit_org_time_idx").on(t.organizationId, t.createdAt), index("audit_entity_idx").on(t.entityType, t.entityId)]);
