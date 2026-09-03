import type { BaseRecord, Id, CurrencyCode, Money } from './primitives';

/**
 * Universal Catalog/Product model.
 *
 * A single canonical `Product` is shared by Sales, POS, Inventory, Procurement
 * and Accounting. Module-specific behaviour lives in configuration tables
 * rather than in duplicated per-module product entities.
 */

export interface Product extends BaseRecord {
  code: string;
  name: string;
  description?: string;
  /** Category the product belongs to (product catalog taxonomy). */
  categoryId?: Id;
  kind: 'product' | 'service';
  /** Price list entries reference the product. */
  uom?: string;
}

/** A product costs/prices depending on context (currency, price list, role). */
export interface PriceListEntry {
  id: Id;
  productId: Id;
  priceListId: Id;
  currency: CurrencyCode;
  unitPrice: number;
}

export interface PriceList {
  id: Id;
  name: string;
  currency: CurrencyCode;
  isDefault: boolean;
}

/** Product belongs to inventory: stockable, tracked in warehouses. */
export interface ProductInventoryConfig {
  id: Id;
  productId: Id;
  isStockable: boolean;
  trackBySerial: boolean;
  reorderLevel?: number;
}

/** Product belongs to procurement: purchasable from suppliers. */
export interface ProductProcurementConfig {
  id: Id;
  productId: Id;
  preferredSupplierId?: Id;
  defaultPurchaseUom?: string;
}

/** Product belongs to accounting: GL integration. */
export interface ProductAccountingConfig {
  id: Id;
  productId: Id;
  incomeAccountId?: Id;
  expenseAccountId?: Id;
  taxCode?: string;
}

/** Product belongs to POS/sales channels. */
export interface ProductSalesConfig {
  id: Id;
  productId: Id;
  isSellable: boolean;
  isService: boolean;
  subscription?: boolean;
}
