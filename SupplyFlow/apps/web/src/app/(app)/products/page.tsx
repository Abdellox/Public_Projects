"use client";

import { EntityTablePage } from "@/components/entity-page";
import type { GridColumn } from "@/components/data-grid";
import type { FormFieldDef } from "@/components/form-drawer";

interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  costPrice: string | null;
  sellingPrice: string | null;
  minStock: number;
  reorderPoint: number | null;
  leadTimeDays: number | null;
}

const columns: GridColumn<Product>[] = [
  { key: "sku", label: "SKU", width: 130, pinned: true },
  { key: "name", label: "Product", width: 240 },
  { key: "unit", label: "Unit", width: 80 },
  { key: "costPrice", label: "Cost", type: "money", width: 100 },
  { key: "sellingPrice", label: "Price", type: "money", width: 100 },
  { key: "minStock", label: "Min stock", type: "number", width: 110 },
  { key: "reorderPoint", label: "Reorder point", type: "number", width: 120 },
  { key: "leadTimeDays", label: "Lead time", type: "number", width: 100 }
];

const fields: FormFieldDef[] = [
  { key: "sku", label: "SKU *", required: true },
  { key: "name", label: "Product name *", required: true },
  { key: "unit", label: "Unit of measure", defaultValue: "unit" },
  { key: "costPrice", label: "Cost price", type: "money" },
  { key: "sellingPrice", label: "Selling price", type: "money" },
  { key: "minStock", label: "Minimum stock", type: "number", defaultValue: 0 },
  { key: "reorderPoint", label: "Reorder point", type: "number" },
  { key: "reorderQuantity", label: "Reorder quantity", type: "number" },
  { key: "maxStock", label: "Maximum stock", type: "number" },
  { key: "leadTimeDays", label: "Lead time (days)", type: "number", defaultValue: 14 }
];

export default function ProductsPage() {
  return (
    <EntityTablePage<Product>
      title="Products"
      description="Your catalog — costs, prices and replenishment parameters."
      endpoint="/api/v1/products"
      entityName="product"
      createLabel="New product"
      exportEntity="products"
      importEntity="products"
      canWrite={true}
      columns={columns}
      formFields={fields}
    />
  );
}
