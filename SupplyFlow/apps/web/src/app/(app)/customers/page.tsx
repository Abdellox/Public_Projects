"use client";

import { EntityTablePage } from "@/components/entity-page";
import type { GridColumn } from "@/components/data-grid";

interface Customer {
  id: string;
  code: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  paymentTerms: string | null;
}

const columns: GridColumn<Customer>[] = [
  { key: "code", label: "Code", width: 100, pinned: true },
  { key: "name", label: "Customer", width: 240 },
  { key: "email", label: "Email", width: 210 },
  { key: "phone", label: "Phone", width: 150 },
  { key: "city", label: "City", width: 140 },
  { key: "country", label: "Country", width: 110 },
  { key: "paymentTerms", label: "Payment terms", width: 120 }
];

const fields = [
  { key: "name", label: "Customer name *", required: true },
  { key: "code", label: "Customer code" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "paymentTerms", label: "Payment terms", defaultValue: "NET30" }
];

export default function CustomersPage() {
  return (
    <EntityTablePage<Customer>
      title="Customers"
      description="Who you sell to."
      endpoint="/api/v1/customers"
      entityName="customer"
      createLabel="New customer"
      exportEntity="customers"
      importEntity="customers"
      canWrite={true}
      columns={columns}
      formFields={fields}
    />
  );
}
