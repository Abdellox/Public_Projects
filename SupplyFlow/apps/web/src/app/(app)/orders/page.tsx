"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataGrid, type GridColumn } from "@/components/data-grid";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui";
import { api, fmtMoney } from "@/lib/client/format";
import { cn } from "@/lib/client/cn";

interface Co {
  id: string;
  number: string;
  customerName: string;
  warehouseName: string | null;
  status: string;
  priority: string;
  orderDate: string | null;
  requiredDate: string | null;
  total: string;
}

interface Option { id: string; label: string }
interface CoLine { productId: string; quantity: number; unitPrice: number }

const columns: GridColumn<Co>[] = [
  { key: "number", label: "Order", width: 130, pinned: true },
  { key: "customerName", label: "Customer", width: 200 },
  {
    key: "priority",
    label: "Priority",
    type: "status",
    width: 100,
    format: (row) => (
      <span className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset",
        row.priority === "urgent" ? "bg-red-50 text-red-700 ring-red-200" :
        row.priority === "high" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-ink-100 text-ink-600 ring-ink-200"
      )}>{row.priority}</span>
    )
  },
  { key: "status", label: "Status", type: "status", width: 140 },
  {
    key: "requiredDate",
    label: "Required by",
    width: 130,
    format: (row) => (
      <span className={cn(row.requiredDate && new Date(row.requiredDate) < new Date() && !["delivered", "shipped"].includes(row.status) ? "font-medium text-red-600" : "")}>
        {row.requiredDate ? new Date(row.requiredDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
      </span>
    )
  },
  { key: "warehouseName", label: "Fulfill from", width: 150 },
  { key: "total", label: "Total", type: "money", width: 120 }
];

export default function OrdersPage() {
  const [data, setData] = useState<Co[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [products, setProducts] = useState<Array<Option & { price: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [lines, setLines] = useState<CoLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cos, custs, whs, prods] = await Promise.all([
        api<{ data: Co[] }>("/api/v1/customer-orders"),
        api<{ data: Array<{ id: string; name: string }> }>("/api/v1/customers"),
        api<{ data: Array<{ id: string; code: string; name: string }> }>("/api/v1/warehouses"),
        api<{ data: Array<{ id: string; sku: string; name: string; sellingPrice: string | null }> }>("/api/v1/products")
      ]);
      setData(cos.data);
      setCustomers(custs.data.map((c) => ({ id: c.id, label: c.name })));
      setWarehouses(whs.data.map((w) => ({ id: w.id, label: `${w.code} — ${w.name}` })));
      setProducts(prods.data.map((p) => ({ id: p.id, label: `${p.sku} — ${p.name}`, price: p.sellingPrice ? parseFloat(p.sellingPrice) : 0 })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (lines.length === 0 || lines.some((l) => !l.productId || l.quantity <= 0)) {
      setError("Add at least one product line.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/v1/customer-orders", {
        method: "POST",
        body: JSON.stringify({
          customerId: fd.get("customerId"),
          warehouseId: fd.get("warehouseId") || null,
          priority: fd.get("priority"),
          requiredDate: fd.get("required") || null,
          status: fd.get("status"),
          lines
        })
      });
      setCreateOpen(false);
      setLines([]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Customer orders"
        description="Demand you need to fulfil."
        actions={<Button size="sm" onClick={() => { setLines([]); setCreateOpen(true); }}><Plus className="h-3.5 w-3.5" /> New order</Button>}
      />
      {error ? <p className="mx-4 mb-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
      <div className="flex-1 min-h-0 mx-4 rounded-lg border border-ink-200 overflow-hidden shadow-card">
        <DataGrid columns={columns} data={data} loading={loading} searchPlaceholder="Search orders or customers…" emptyTitle="No customer orders yet" />
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button aria-label="Close" className="absolute inset-0 bg-ink-950/30" onClick={() => setCreateOpen(false)} />
          <form onSubmit={createOrder} className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-xl border-l border-ink-200">
            <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <h2 className="text-[15px] font-semibold">New customer order</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>Close</Button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Customer *</span>
                  <select name="customerId" required defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                    <option value="" disabled>Select…</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </label>
                <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Fulfill from</span>
                  <select name="warehouseId" defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                    <option value="">—</option>
                    {warehouses.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
                  </select>
                </label>
                <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Priority</span>
                  <select name="priority" defaultValue="medium" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </label>
                <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Required by</span>
                  <input name="required" type="date" className="h-9 w-full rounded-md border border-ink-200 px-3 text-[13px]" />
                </label>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-ink-600">Line items</span>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setLines((l) => [...l, { productId: "", quantity: 1, unitPrice: 0 }])}>
                    <Plus className="h-3.5 w-3.5" /> Add line
                  </Button>
                </div>
                <div className="space-y-2">
                  {lines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border border-ink-100 p-2">
                      <select value={line.productId}
                        onChange={(e) => {
                          const product = products.find((p) => p.id === e.target.value);
                          setLines((ls) => ls.map((l, li) => li === i ? { ...l, productId: e.target.value, unitPrice: product?.price ?? l.unitPrice } : l));
                        }}
                        className="h-8 flex-1 rounded border border-ink-200 px-2 text-[12px]">
                        <option value="">Select product…</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                      <input type="number" min="0" step="any" value={line.quantity || ""} placeholder="Qty"
                        onChange={(e) => setLines((ls) => ls.map((l, li) => li === i ? { ...l, quantity: Number(e.target.value) } : l))}
                        className="h-8 w-20 rounded border border-ink-200 px-2 text-[12px]" />
                      <input type="number" min="0" step="0.01" value={line.unitPrice || ""} placeholder="Unit price"
                        onChange={(e) => setLines((ls) => ls.map((l, li) => li === i ? { ...l, unitPrice: Number(e.target.value) } : l))}
                        className="h-8 w-24 rounded border border-ink-200 px-2 text-[12px]" />
                      <button type="button" onClick={() => setLines((ls) => ls.filter((_, li) => li !== i))} className="text-ink-300 hover:text-red-500">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  {lines.length === 0 ? <p className="text-[12px] text-ink-400 py-3 text-center border border-dashed border-ink-200 rounded-md">No lines yet.</p> : null}
                </div>
              </div>
            </div>
            <footer className="flex items-center justify-between border-t border-ink-100 px-5 py-3.5">
              <span className="text-[13px] text-ink-500">Total: <strong className="text-ink-900">{fmtMoney(lines.reduce((a, l) => a + l.quantity * l.unitPrice, 0))}</strong></span>
              <Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create order"}</Button>
            </footer>
          </form>
        </div>
      ) : null}
    </div>
  );
}
