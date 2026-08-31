"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ArrowLeftRight } from "lucide-react";
import { DataGrid, type GridColumn } from "@/components/data-grid";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui";
import { api } from "@/lib/client/format";
import { cn } from "@/lib/client/cn";

interface InventoryRow {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  warehouse_id: string;
  warehouse_code: string;
  on_hand: number;
  reserved: number;
  available: number;
  damaged: number;
  value: string | null;
}

interface MovementRow {
  id: string;
  sku: string;
  productName: string;
  warehouseCode: string;
  type: string;
  quantity: number;
  reason: string | null;
  performedByName: string | null;
  occurredAt: string;
}

interface Option { id: string; label: string }

const invColumns: GridColumn<InventoryRow>[] = [
  { key: "sku", label: "SKU", width: 130, pinned: true },
  { key: "name", label: "Product", width: 230 },
  { key: "warehouse_code", label: "Warehouse", width: 110 },
  { key: "on_hand", label: "On hand", type: "number", width: 100 },
  { key: "reserved", label: "Reserved", type: "number", width: 100 },
  {
    key: "available",
    label: "Available",
    width: 100,
    format: (row) => (
      <span className={cn("tabular-nums font-medium", row.available <= 0 ? "text-red-600" : "")}>
        {row.available.toLocaleString()}
      </span>
    )
  },
  { key: "damaged", label: "Damaged", type: "number", width: 90 },
  { key: "value", label: "Stock value", type: "money", width: 120 }
];

export default function InventoryPage() {
  const [data, setData] = useState<InventoryRow[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [inv, prods, whs, movs] = await Promise.all([
        api<{ data: InventoryRow[] }>("/api/v1/inventory"),
        api<{ data: Array<{ id: string; sku: string; name: string }> }>("/api/v1/products"),
        api<{ data: Array<{ id: string; code: string; name: string }> }>("/api/v1/warehouses"),
        api<{ data: MovementRow[] }>("/api/v1/inventory/movements?limit=30")
      ]);
      setData(inv.data.filter((r) => r.on_hand !== 0 || r.reserved !== 0));
      setProducts(prods.data.map((p) => ({ id: p.id, label: `${p.sku} — ${p.name}` })));
      setWarehouses(whs.data.map((w) => ({ id: w.id, label: `${w.code} — ${w.name}` })));
      setMovements(movs.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Inventory"
        description="Live stock positions across all warehouses."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setTransferOpen(true)}>
              <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
            </Button>
            <Button size="sm" onClick={() => setAdjustOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Adjust
            </Button>
          </>
        }
      />
      {error ? <p className="mx-4 mb-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
      <div className="flex-1 min-h-0 mx-4 rounded-lg border border-ink-200 overflow-hidden shadow-card">
        <DataGrid columns={invColumns} data={data} loading={loading} searchPlaceholder="Search stock…" emptyTitle="No stock records yet" />
      </div>

      <div className="mx-4 my-4 flex-0 rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-ink-100">
          <h2 className="text-[13px] font-semibold text-ink-800">Recent movements</h2>
          <p className="text-[11px] text-ink-400">Every change is traceable — receipts, shipments, transfers and corrections.</p>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-ink-400 border-b border-ink-100 bg-ink-50/60">
              <th className="px-4 py-1.5 font-medium">When</th>
              <th className="px-4 py-1.5 font-medium">Product</th>
              <th className="px-4 py-1.5 font-medium">Warehouse</th>
              <th className="px-4 py-1.5 font-medium">Type</th>
              <th className="px-4 py-1.5 font-medium text-right">Qty</th>
              <th className="px-4 py-1.5 font-medium">By</th>
              <th className="px-4 py-1.5 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-b border-ink-50 hover:bg-ink-50/50">
                <td className="px-4 py-1.5 text-ink-500 whitespace-nowrap">{new Date(m.occurredAt).toLocaleDateString()}</td>
                <td className="px-4 py-1.5"><span className="font-mono text-[11px] text-ink-500 mr-2">{m.sku}</span>{m.productName}</td>
                <td className="px-4 py-1.5">{m.warehouseCode}</td>
                <td className="px-4 py-1.5 capitalize text-ink-600">{m.type.replace(/_/g, " ")}</td>
                <td className={"px-4 py-1.5 text-right tabular-nums font-medium " + (["receipt", "transfer_in", "return_customer"].includes(m.type) ? "text-emerald-600" : m.type === "adjustment" ? "text-blue-600" : "text-ink-700")}>
                  {["receipt", "transfer_in", "return_customer", "shipment", "transfer_out", "damage", "return_supplier"].includes(m.type) && !["receipt", "transfer_in", "return_customer"].includes(m.type) ? "−" : "+"}
                  {Math.abs(m.quantity).toLocaleString()}
                </td>
                <td className="px-4 py-1.5 text-ink-500">{m.performedByName ?? "—"}</td>
                <td className="px-4 py-1.5 text-ink-400 truncate max-w-[220px]">{m.reason ?? "—"}</td>
              </tr>
            ))}
            {movements.length === 0 && !loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-400">No movements recorded yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {adjustOpen ? (
        <SimpleModal title="Adjust stock" onClose={() => setAdjustOpen(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await api("/api/v1/inventory", {
                  method: "POST",
                  body: JSON.stringify({
                    kind: "adjust",
                    productId: fd.get("productId"),
                    warehouseId: fd.get("warehouseId"),
                    type: fd.get("type"),
                    quantity: Number(fd.get("quantity")),
                    reason: String(fd.get("reason") || "")
                  })
                });
                setAdjustOpen(false);
                await load();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Adjustment failed");
              }
            }}
            className="space-y-3"
          >
            <SelectField label="Product" name="productId" options={products} required />
            <SelectField label="Warehouse" name="warehouseId" options={warehouses} required />
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-ink-600">Type</span>
              <select name="type" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]" defaultValue="adjustment">
                <option value="adjustment">Correction (+/−)</option>
                <option value="damage">Damage (−)</option>
                <option value="return_supplier">Return to supplier (−)</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-ink-600">Quantity (negative to decrease)</span>
              <input name="quantity" type="number" step="any" required className="h-9 w-full rounded-md border border-ink-200 px-3 text-[13px]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-ink-600">Reason</span>
              <input name="reason" className="h-9 w-full rounded-md border border-ink-200 px-3 text-[13px]" placeholder="Cycle count correction" />
            </label>
            <Button type="submit" className="w-full mt-1">Apply adjustment</Button>
          </form>
        </SimpleModal>
      ) : null}

      {transferOpen ? (
        <SimpleModal title="Transfer stock between warehouses" onClose={() => setTransferOpen(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await api("/api/v1/inventory", {
                  method: "POST",
                  body: JSON.stringify({
                    kind: "transfer",
                    fromWarehouseId: fd.get("from"),
                    toWarehouseId: fd.get("to"),
                    lines: [{ productId: fd.get("productId"), quantity: Number(fd.get("quantity")) }]
                  })
                });
                setTransferOpen(false);
                await load();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Transfer failed");
              }
            }}
            className="space-y-3"
          >
            <SelectField label="From warehouse" name="from" options={warehouses} required />
            <SelectField label="To warehouse" name="to" options={warehouses} required />
            <SelectField label="Product" name="productId" options={products} required />
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-ink-600">Quantity</span>
              <input name="quantity" type="number" step="any" min="0" required className="h-9 w-full rounded-md border border-ink-200 px-3 text-[13px]" />
            </label>
            <Button type="submit" className="w-full mt-1">Create transfer</Button>
          </form>
        </SimpleModal>
      ) : null}
    </div>
  );
}

function SimpleModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" className="absolute inset-0 bg-ink-950/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-ink-200 bg-white shadow-xl p-5">
        <h2 className="text-[15px] font-semibold text-ink-900 mb-3">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function SelectField({ label, name, options, required }: { label: string; name: string; options: Option[]; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-ink-600">{label}</span>
      <select name={name} required={required} className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]" defaultValue="">
        <option value="" disabled>Select…</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}
