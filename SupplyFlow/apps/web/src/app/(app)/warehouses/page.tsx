"use client";

import { EntityTablePage } from "@/components/entity-page";
import type { GridColumn } from "@/components/data-grid";

interface Warehouse {
  id: string;
  code: string;
  name: string;
  city: string | null;
  country: string | null;
  isDefault: boolean;
}

const columns: GridColumn<Warehouse>[] = [
  {
    key: "code",
    label: "Code",
    width: 120,
    pinned: true,
    format: (row) => (
      <span className="font-medium">
        {row.code}
        {row.isDefault ? <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">default</span> : null}
      </span>
    )
  },
  { key: "name", label: "Warehouse", width: 260 },
  { key: "city", label: "City", width: 160 },
  { key: "country", label: "Country", width: 120 }
];

const fields = [
  { key: "code", label: "Code *", required: true, placeholder: "WH-EAST" },
  { key: "name", label: "Warehouse name *", required: true },
  { key: "city", label: "City" },
  { key: "country", label: "Country" }
];

export default function WarehousesPage() {
  return (
    <EntityTablePage<Warehouse>
      title="Warehouses"
      description="Locations where your stock lives."
      endpoint="/api/v1/warehouses"
      entityName="warehouse"
      createLabel="New warehouse"
      exportEntity=""
      canWrite={true}
      columns={columns}
      formFields={fields}
    />
  );
}
