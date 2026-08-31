"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Download, Upload } from "lucide-react";
import { DataGrid, type GridColumn } from "@/components/data-grid";
import { FormDrawer, type FormFieldDef } from "@/components/form-drawer";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/client/format";
import { ImportWizard } from "@/components/import-wizard";

interface EntityTablePageProps<T extends { id: string }> {
  title: string;
  description?: string;
  endpoint: string;
  columns: GridColumn<T>[];
  formFields?: FormFieldDef[];
  createLabel?: string;
  canWrite: boolean;
  entityName: string;
  exportEntity: string;
  importEntity?: "products" | "suppliers" | "customers" | null;
  transformCreate?: (values: Record<string, string>) => Record<string, unknown>;
  toolbarExtra?: React.ReactNode;
}

export function EntityTablePage<T extends { id: string }>({
  title,
  description,
  endpoint,
  columns,
  formFields,
  createLabel = "New record",
  canWrite,
  entityName,
  exportEntity,
  importEntity = null,
  transformCreate,
  toolbarExtra
}: EntityTablePageProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api<{ data: T[] }>(endpoint);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(values: Record<string, string>) {
    const payload = transformCreate ? transformCreate(values) : values;
    await api(endpoint, { method: "POST", body: JSON.stringify(payload) });
    await load();
  }

  async function updateCell(row: T, column: GridColumn<T>, value: string) {
    let parsedValue: string | number | null = value;
    if (column.type === "number" || column.type === "money") parsedValue = value === "" ? null : Number(value);
    await api(`${endpoint}/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ [column.key]: parsedValue })
    });
    await load();
  }

  async function deleteRow(row: T) {
    if (!confirm(`Delete this ${entityName}? This cannot be undone.`)) return;
    await api(`${endpoint}/${row.id}`, { method: "DELETE" });
    await load();
  }

  const editableColumns = columns.map((c) => (canWrite ? { ...c, editable: c.editable ?? true } : { ...c, editable: false }));

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => window.open(`/api/v1/export?entity=${exportEntity}&format=csv`, "_blank")}>
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.open(`/api/v1/export?entity=${exportEntity}&format=xlsx`, "_blank")}>
              <Download className="h-3.5 w-3.5" /> XLSX
            </Button>
            {canWrite && importEntity ? (
              <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="h-3.5 w-3.5" /> Import
              </Button>
            ) : null}
            {canWrite && formFields ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> {createLabel}
              </Button>
            ) : null}
          </>
        }
      />
      <div className="flex-1 min-h-0 mx-4 mb-4 rounded-lg border border-ink-200 overflow-hidden shadow-card">
        <DataGrid
          columns={editableColumns}
          data={data}
          loading={loading}
          onUpdateCell={canWrite ? updateCell : undefined}
          onDeleteRow={canWrite ? deleteRow : undefined}
          searchPlaceholder={`Search ${entityName}s…`}
          emptyTitle={`No ${entityName}s yet`}
          emptyDescription={canWrite && formFields ? `Create your first ${entityName} to get started.` : undefined}
          toolbar={toolbarExtra}
        />
      </div>

      {formFields ? (
        <FormDrawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          title={createLabel}
          fields={formFields}
          submitLabel={`Create ${entityName}`}
          onSubmit={handleCreate}
        />
      ) : null}

      {importEntity && canWrite ? (
        <ImportWizard open={importOpen} onClose={() => setImportOpen(false)} entity={importEntity} onDone={() => void load()} />
      ) : null}
    </div>
  );
}
