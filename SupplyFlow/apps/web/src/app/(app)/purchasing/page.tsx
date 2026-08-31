"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DataGrid, type GridColumn } from "@/components/data-grid";
import { PageHeader } from "@/components/page-header";
import { Button, StatusBadge } from "@/components/ui";
import { api, fmtMoney, fmtDate } from "@/lib/client/format";
import { cn } from "@/lib/client/cn";

interface Po {
  id: string;
  number: string;
  supplierName: string;
  warehouseName: string | null;
  status: string;
  orderDate: string | null;
  expectedDate: string | null;
  total: string;
  currency: string;
  receivedQty: number;
  orderedQty: number;
}

interface PoLine { productId: string; quantity: number; unitCost: number }

interface Option { id: string; label: string }

const columns: GridColumn<Po>[] = [
  { key: "number", label: "PO number", width: 130, pinned: true },
  { key: "supplierName", label: "Supplier", width: 200 },
  { key: "status", label: "Status", type: "status", width: 140 },
  {
    key: "receivedQty",
    label: "Received",
    width: 150,
    format: (row) => {
      const pct = row.orderedQty > 0 ? Math.min(100, Math.round((row.receivedQty / row.orderedQty) * 100)) : 0;
      return (
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-16 rounded-full bg-ink-100 overflow-hidden">
            <span className={cn("block h-full rounded-full", pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-cyan-500" : "bg-transparent")} style={{ width: `${pct}%` }} />
          </span>
          <span className="tabular-nums text-[12px] text-ink-500">{pct}%</span>
        </span>
      );
    }
  },
  { key: "orderDate", label: "Ordered", type: "date", width: 110 },
  { key: "expectedDate", label: "Expected", type: "date", width: 110 },
  { key: "total", label: "Total", type: "money", width: 120 }
];

export default function PurchasingPage() {
  const [data, setData] = useState<Po[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [products, setProducts] = useState<Array<Option & { cost: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<null | { po: Po; lines: Array<{ id: string; sku: string; productName: string; quantity: number; quantityReceived: number; unitCost: string; total: string }>; activities: Array<{ id: string; summary: string | null; createdAt: string }> }>(null);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<PoLine[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [pos, sups, whs, prods] = await Promise.all([
        api<{ data: Po[] }>("/api/v1/purchase-orders"),
        api<{ data: Array<{ id: string; name: string }> }>("/api/v1/suppliers"),
        api<{ data: Array<{ id: string; code: string; name: string }> }>("/api/v1/warehouses"),
        api<{ data: Array<{ id: string; sku: string; name: string; costPrice: string | null }> }>("/api/v1/products")
      ]);
      setData(pos.data);
      setSuppliers(sups.data.map((s) => ({ id: s.id, label: s.name })));
      setWarehouses(whs.data.map((w) => ({ id: w.id, label: `${w.code} — ${w.name}` })));
      setProducts(prods.data.map((p) => ({ id: p.id, label: `${p.sku} — ${p.name}`, cost: p.costPrice ? parseFloat(p.costPrice) : 0 })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetail(po: Po) {
    const res = await api<{ data: NonNullable<typeof detail> }>(`/api/v1/purchase-orders/${po.id}`);
    setDetail(res.data);
  }

  async function transition(poId: string, status: string) {
    try {
      await api(`/api/v1/purchase-orders/${poId}/status`, { method: "POST", body: JSON.stringify({ status }) });
      await load();
      if (detail) await openDetail(detail.po);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transition failed");
    }
  }

  async function createPo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (lines.length === 0 || lines.some((l) => !l.productId || l.quantity <= 0)) {
      setError("Add at least one product line with quantity.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/api/v1/purchase-orders", {
        method: "POST",
        body: JSON.stringify({
          supplierId: fd.get("supplierId"),
          warehouseId: fd.get("warehouseId") || null,
          expectedDate: fd.get("expectedDate") || null,
          notes: String(fd.get("notes") || "") || null,
          lines
        })
      });
      setCreateOpen(false);
      setLines([]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create PO");
    } finally {
      setBusy(false);
    }
  }

  const nextActions: Record<string, Array<{ label: string; status: string; primary?: boolean }>> = {
    draft: [{ label: "Send to supplier", status: "sent", primary: true }],
    sent: [{ label: "Mark confirmed", status: "confirmed", primary: true }],
    confirmed: [{ label: "Mark received", status: "received", primary: true }],
    partially_received: [{ label: "Mark fully received", status: "received", primary: true }]
  };

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Purchase orders"
        description="What you're buying, from whom, and when it's due."
        actions={<Button size="sm" onClick={() => { setLines([]); setCreateOpen(true); }}><Plus className="h-3.5 w-3.5" /> New purchase order</Button>}
      />
      {error ? <p className="mx-4 mb-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
      <div className="flex-1 min-h-0 mx-4 rounded-lg border border-ink-200 overflow-hidden shadow-card">
        <DataGrid
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Search orders or suppliers…"
          onRowClick={(row) => void openDetail(row)}
          emptyTitle="No purchase orders yet"
          emptyDescription="Create your first PO to start tracking incoming stock."
        />
      </div>

      {/* Create PO modal */}
      {createOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button aria-label="Close" className="absolute inset-0 bg-ink-950/30" onClick={() => setCreateOpen(false)} />
          <form onSubmit={createPo} className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-xl border-l border-ink-200">
            <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <h2 className="text-[15px] font-semibold">New purchase order</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>Close</Button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Supplier *</span>
                  <select name="supplierId" required defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                    <option value="" disabled>Select…</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </label>
                <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Deliver to</span>
                  <select name="warehouseId" defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                    <option value="">—</option>
                    {warehouses.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
                  </select>
                </label>
                <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Expected delivery</span>
                  <input name="expectedDate" type="date" className="h-9 w-full rounded-md border border-ink-200 px-3 text-[13px]" />
                </label>
                <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Notes</span>
                  <input name="notes" className="h-9 w-full rounded-md border border-ink-200 px-3 text-[13px]" />
                </label>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-ink-600">Line items</span>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setLines((l) => [...l, { productId: "", quantity: 1, unitCost: 0 }])}>
                    <Plus className="h-3.5 w-3.5" /> Add line
                  </Button>
                </div>
                <div className="space-y-2">
                  {lines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border border-ink-100 p-2">
                      <select
                        value={line.productId}
                        onChange={(e) => {
                          const product = products.find((p) => p.id === e.target.value);
                          setLines((ls) => ls.map((l, li) => li === i ? { ...l, productId: e.target.value, unitCost: product?.cost ?? l.unitCost } : l));
                        }}
                        className="h-8 flex-1 rounded border border-ink-200 px-2 text-[12px]"
                      >
                        <option value="">Select product…</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                      <input type="number" min="0" step="any" value={line.quantity || ""} placeholder="Qty"
                        onChange={(e) => setLines((ls) => ls.map((l, li) => li === i ? { ...l, quantity: Number(e.target.value) } : l))}
                        className="h-8 w-20 rounded border border-ink-200 px-2 text-[12px]" />
                      <input type="number" min="0" step="0.01" value={line.unitCost || ""} placeholder="Unit cost"
                        onChange={(e) => setLines((ls) => ls.map((l, li) => li === i ? { ...l, unitCost: Number(e.target.value) } : l))}
                        className="h-8 w-24 rounded border border-ink-200 px-2 text-[12px]" />
                      <span className="w-20 text-right tabular-nums text-[12px] text-ink-500">{fmtMoney(line.quantity * line.unitCost)}</span>
                      <button type="button" onClick={() => setLines((ls) => ls.filter((_, li) => li !== i))} className="text-ink-300 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {lines.length === 0 ? <p className="text-[12px] text-ink-400 py-3 text-center border border-dashed border-ink-200 rounded-md">No lines yet — add products to order.</p> : null}
                </div>
              </div>
            </div>
            <footer className="flex items-center justify-between border-t border-ink-100 px-5 py-3.5">
              <span className="text-[13px] text-ink-500">Total: <strong className="text-ink-900">{fmtMoney(lines.reduce((a, l) => a + l.quantity * l.unitCost, 0))}</strong></span>
              <Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create draft PO"}</Button>
            </footer>
          </form>
        </div>
      ) : null}

      {/* Detail drawer */}
      {detail ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button aria-label="Close" className="absolute inset-0 bg-ink-950/30" onClick={() => setDetail(null)} />
          <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-xl border-l border-ink-200">
            <header className="flex items-start justify-between px-5 py-4 border-b border-ink-100">
              <div>
                <h2 className="text-[15px] font-semibold">{detail.po.number}</h2>
                <p className="mt-0.5 flex items-center gap-2 text-[12px] text-ink-500">
                  <StatusBadge value={detail.po.status} /> {detail.po.supplierName} · total {fmtMoney(detail.po.total, detail.po.currency)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDetail(null)}>Close</Button>
            </header>

            <div className="flex gap-2 px-5 py-3 border-b border-ink-100 bg-ink-50/60">
              {(nextActions[detail.po.status] ?? []).map((a) => (
                <Button key={a.status} size="sm" variant={a.primary ? "primary" : "secondary"} onClick={() => void transition(detail.po.id, a.status)}>
                  {a.label}
                </Button>
              ))}
              {["draft", "sent", "confirmed"].includes(detail.po.status) ? (
                <Button size="sm" variant="ghost" className="ml-auto text-red-600 hover:bg-red-50" onClick={() => void transition(detail.po.id, "cancelled")}>
                  Cancel order
                </Button>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <section>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Line items</h3>
                <table className="w-full text-[12px]">
                  <thead><tr className="text-left text-ink-400 border-b border-ink-100"><th className="py-1.5 font-medium">Product</th><th className="font-medium text-right">Ordered</th><th className="font-medium text-right">Received</th><th className="font-medium text-right">Unit cost</th></tr></thead>
                  <tbody>
                    {detail.lines.map((l) => (
                      <tr key={l.id} className="border-b border-ink-50">
                        <td className="py-1.5"><span className="font-mono text-[11px] text-ink-400 mr-1.5">{l.sku}</span>{l.productName}</td>
                        <td className="text-right tabular-nums">{l.quantity.toLocaleString()}</td>
                        <td className="text-right tabular-nums">{l.quantityReceived.toLocaleString()}</td>
                        <td className="text-right tabular-nums">{fmtMoney(l.unitCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Activity timeline</h3>
                <ol className="space-y-2.5">
                  {detail.activities.length === 0 ? <li className="text-[12px] text-ink-400">No activity recorded.</li> : null}
                  {detail.activities.map((a) => (
                    <li key={a.id} className="flex gap-2.5 text-[12px]">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      <span><span className="text-ink-700">{a.summary ?? a.id}</span> <span className="text-ink-400">· {fmtDate(a.createdAt, true)}</span></span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
