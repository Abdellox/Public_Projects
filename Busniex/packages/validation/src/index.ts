import { z } from 'zod';

const isoDateTime = z.string().datetime();

export const moneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().min(3).max(3),
});

export const priceListEntrySchema = z.object({
  productId: z.string(),
  priceListId: z.string(),
  unitPrice: z.number().nonnegative(),
});

export const partySchema = z.object({
  kind: z.enum(['person', 'organization']),
  name: z.string().min(1),
  emails: z.array(z.string().email()).default([]),
  phones: z.array(z.string()).default([]),
});

export const contactSchema = z.object({
  partyId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  title: z.string().optional(),
  emails: z.array(z.string().email()).default([]),
  phones: z.array(z.string()).default([]),
  organizationPartyId: z.string().optional(),
});

export const organizationUnitSchema = z.object({
  parentId: z.string().nullable().optional(),
  type: z.enum([
    'group',
    'legalEntity',
    'businessUnit',
    'division',
    'department',
    'branch',
    'location',
    'warehouse',
    'team',
    'project',
  ]),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const legalEntitySchema = z.object({
  organizationId: z.string(),
  legalName: z.string().min(1),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  country: z.string().length(2),
  defaultCurrency: z.string().length(3),
  address: z.string().optional(),
});

export const locationSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().length(2),
  timezone: z.string().optional(),
  isWarehouse: z.boolean().default(false),
});

export const productSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  kind: z.enum(['product', 'service']).default('product'),
  uom: z.string().optional(),
});

export const userSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  password: z.string().min(8),
});

export const roleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export const quoteLineSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

export const quoteSchema = z.object({
  customerPartyId: z.string(),
  opportunityId: z.string().optional(),
  currency: z.string().length(3),
  lineItems: z.array(quoteLineSchema).min(1),
  validUntil: z.string().optional(),
});

export const salesOrderSchema = z.object({
  customerPartyId: z.string(),
  warehouseId: z.string().optional(),
  currency: z.string().length(3),
  lineItems: z.array(quoteLineSchema).min(1),
});

export const inventoryItemSchema = z.object({
  productId: z.string(),
  locationId: z.string(),
  quantityOnHand: z.number().nonnegative(),
  reservedQuantity: z.number().nonnegative().default(0),
});

export const stockMovementSchema = z.object({
  productId: z.string(),
  locationId: z.string(),
  quantity: z.number(),
  type: z.enum(['in', 'out', 'transfer', 'adjustment', 'reserve', 'release']),
  referenceId: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  supplierPartyId: z.string(),
  warehouseId: z.string().optional(),
  currency: z.string().length(3),
  lineItems: z.array(quoteLineSchema).min(1),
});

export const invoiceSchema = z.object({
  direction: z.enum(['outgoing', 'incoming']).default('outgoing'),
  customerPartyId: z.string().optional(),
  supplierPartyId: z.string().optional(),
  currency: z.string().length(3),
  lineItems: z.array(quoteLineSchema).min(1),
  dueDate: z.string().optional(),
  legalEntityId: z.string().optional(),
});

export const paymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  method: z.enum(['cash', 'card', 'bank_transfer', 'check', 'online', 'other']),
  reference: z.string().optional(),
});

export const posOrderSchema = z.object({
  customerPartyId: z.string().optional(),
  locationId: z.string(),
  currency: z.string().length(3),
  lineItems: z.array(quoteLineSchema).min(1),
});

export const leadSchema = z.object({
  companyPartyId: z.string().optional(),
  contactId: z.string().optional(),
  source: z.enum(['web', 'referral', 'cold', 'event', 'other']).default('other'),
});

export const opportunitySchema = z.object({
  name: z.string().min(1),
  customerPartyId: z.string(),
  amount: moneySchema,
  probability: z.number().min(0).max(100),
});

export const approveSchema = z.object({
  note: z.string().optional(),
});

export const auditLogSchema = z.object({
  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string(),
  previousValue: z.string().optional(),
  newValue: z.string().optional(),
});

export const moduleDescriptorSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  group: z.enum([
    'commercial',
    'finance',
    'human-resources',
    'supply-chain',
    'enterprise',
    'projects',
    'intelligence',
  ]),
  permissions: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
});

export { isoDateTime };
