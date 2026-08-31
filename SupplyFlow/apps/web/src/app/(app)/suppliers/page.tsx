"use client";

import { EntityTablePage } from "@/components/entity-page";
import type { GridColumn } from "@/components/data-grid";
import type { FormFieldDef } from "@/components/form-drawer";

interface Supplier {
  id: string;
  code: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  paymentTerms: string | null;
  defaultLeadTimeDays: number | null;
}

const columns: GridColumn<Supplier>[] = [
  { key: "code", label: "Code", width: 100, pinned: true },
  { key: "name", label: "Supplier", width: 240 },
  { key: "email", label: "Email", width: 210 },
  { key: "phone", label: "Phone", width: 150 },
  { key: "city", label: "City", width: 140 },
  { key: "country", label: "Country", width: 110 },
  { key: "paymentTerms", label: "Payment terms", width: 120 },
  { key: "defaultLeadTimeDays", label: "Lead time (days)", type: "number", width: 120 }
];

const fields: FormFieldDef[] = [
  { key: "name", label: "Supplier name *", required: true },
  { key: "code", label: "Supplier code" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "addressLine1", label: "Address" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "taxId", label: "Tax ID" },
  { key: "paymentTerms", label: "Payment terms", defaultValue: "NET30" },
  { key: "defaultLeadTimeDays", label: "Default lead time (days)", type: "number", defaultValue: 14 }
];

export default function SuppliersPage() {
  return (
    <EntityTablePage<Supplier>
      title="Suppliers"
      description="Your sourcing network and their terms."
      endpoint="/api/v1/suppliers"
      entityName="supplier"
      createLabel="New supplier"
      exportEntity="suppliers"
      importEntity="suppliers"
      canWrite={true}
      columns={columns}
      formFields={fields}
    />
  );
}
