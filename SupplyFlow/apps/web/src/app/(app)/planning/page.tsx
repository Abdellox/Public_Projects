"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, RiskDot } from "@/components/ui";
import { api } from "@/lib/client/format";
import { cn } from "@/lib/client/cn";

interface PlanningRowData {
  productId: string;
  sku: string;
  name: string;
  supplierId: string | null;
  supplierName: string | null;
  leadTimeDays: number;
  position: {
    onHand: number;
    reserved: number;
    incoming: number;
    available: number;
    projected: number;
    reorderPoint: number | null;
    risk: string;
    daysOfCover: number | null;
    recommendedOrderQty: number | null;
  };
}

export default function PlanningPage() {
  const [rows, setRows] = useState<PlanningRowData[]>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string; onTimeRate: number | null; averageDelayDays: number | null; openOrders: number; committedValue: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const plan = await api<{ data: { rows: PlanningRowData[]; suppliers: Array<{ supplierId: string; name: string; onTimeRate: number | null; averageDelayDays: number | null; openOrders: number; committedValue: string | null }> } }>("/api/v1/planning");
      setRows(plan.data.rows.filter((r) => r.position.risk !== "healthy"));
      setSuppliers(plan.data.suppliers.map((s) => ({ ...s, id: s.supplierId })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function toggle(sku: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(sku)) next.delete(sku); else next.add(sku);
      return next;
    });
  }

  async function approveReorder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected.size === 0) return;
    const fd = new FormData(e.currentTarget);
    const items = rows.filter((r) => selected.has(r.sku)).map((r) => ({
      productId: r.productId,
      quantity: r.position.recommendedOrderQty ?? Math.max((r.position.reorderPoint ?? 0), r.position.onHand)
    }));
    const supplierId = String(fd.get("supplierId") || "");
    if (!supplierId) { setError("Choose a supplier for the draft PO."); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ data: { number: string } }>("/api/v1/planning/approve-reorder", {
        method: "POST",
        body: JSON.stringify({ supplierId, warehouseId: fd.get("warehouseId") || null, expectedDate: fd.get("expectedDate") || null, items })
      });
      setMessage(`Draft purchase order ${res.data.number} created with ${items.length} line${items.length === 1 ? "" : "s"}. Review it in Purchase orders.`);
      setSelected(new Set());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create PO");
    } finally {
      setBusy(false);
    }
  }

  const columns = null;
  void columns;

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Supply planning"
        description="Projected availability per product: stock − reserved + incoming − forecast demand."
        actions={
          selected.size > 0 ? (
            <form onSubmit={approveReorder} className="flex items-center gap-2">
              <select name="supplierId" className="h-8 rounded-md border border-ink-200 px-2 text-[12px]" defaultValue="">
                <option value="" disabled>Supplier…</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Button size="sm" disabled={busy}>
                <ShoppingCart className="h-3.5 w-3.5" /> Create draft PO ({selected.size})
              </Button>
            </form>
          ) : (
            <span className="text-[12px] text-ink-400">Select at-risk products to create a replenishment order</span>
          )
        }
      />
      {error ? <p className="mx-4 mb-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
      {message ? <p className="mx-4 mb-2 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{message}</p> : null}

      <div className="flex-1 min-h-0 mx-4 grid grid-cols-[1fr_280px] gap-4 pb-4">
        <div className="rounded-lg border border-ink-200 overflow-hidden shadow-card bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-[11px] uppercase tracking-wide text-ink-500">
                <th className="px-3 py-2 w-10"></th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2 text-right">Available</th>
                <th className="px-3 py-2 text-right">Incoming</th>
                <th className="px-3 py-2 text-right">Forecast (30d)</th>
                <th className="px-3 py-2 text-right">Projected</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Supplier</th>
                <th className="px-3 py-2 text-right">Suggested qty</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-16 text-center text-ink-400">Calculating supply positions…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-ink-400">All products are healthy. Nothing needs attention.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.productId} className="border-b border-ink-100 hover:bg-brand-50/40">
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selected.has(r.sku)} onChange={() => toggle(r.sku)} className="h-3.5 w-3.5" aria-label={`Select ${r.name}`} />
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-[11px] text-ink-400 mr-2">{r.sku}</span>{r.name}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.position.available.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-blue-600">{r.position.incoming ? `+${r.position.incoming.toLocaleString()}` : "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink-500">−{Math.round(r.position.available + r.position.incoming - r.position.projected).toLocaleString()}</td>
                  <td className={cn("px-3 py-2 text-right tabular-nums font-medium", r.position.projected <= 0 ? "text-red-600" : "")}>
                    {Math.round(r.position.projected).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 capitalize whitespace-nowrap">
                    <span className="inline-flex items-center"><RiskDot risk={r.position.risk} />{r.position.risk.replace(/_/g, " ")}</span>
                    {r.position.daysOfCover !== null && r.position.risk !== "out_of_stock" ? (
                      <span className="ml-1.5 text-[11px] text-ink-400">~{r.position.daysOfCover}d</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-ink-600 truncate max-w-[160px]">{r.supplierName ?? "—"}<span className="block text-[11px] text-ink-400">lead ~{r.leadTimeDays}d</span></td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-brand-700">
                    {r.position.recommendedOrderQty ? r.position.recommendedOrderQty.toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="overflow-y-auto space-y-3">
          <div className="rounded-lg border border-ink-200 bg-white shadow-card p-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-ink-500 mb-3">How projections work</h2>
            <p className="text-[12px] leading-relaxed text-ink-600">
              Projected = on-hand − reserved + incoming − next-30-day demand.
              Demand comes from your forecasts, falling back to trailing shipped volume.
              Suggestions are recommendations only — nothing is ordered until you approve.
            </p>
          </div>

          <div className="rounded-lg border border-ink-200 bg-white shadow-card p-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-ink-500 mb-3">Supplier performance</h2>
            <ul className="space-y-2.5">
              {suppliers.slice(0, 6).map((s) => (
                <li key={s.id} className="text-[12px]">
                  <div className="flex justify-between font-medium text-ink-800">
                    <span className="truncate pr-2">{s.name}</span>
                    <span className={cn("tabular-nums", s.onTimeRate !== null && s.onTimeRate < 0.85 ? "text-red-600" : "text-emerald-600")}>
                      {s.onTimeRate !== null ? `${Math.round(s.onTimeRate * 100)}%` : "—"}
                    </span>
                  </div>
                  <div className="h-1 mt-1 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={cn("h-full", s.onTimeRate !== null && s.onTimeRate < 0.85 ? "bg-red-500" : "bg-emerald-500")}
                      style={{ width: `${(s.onTimeRate ?? 0) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-400">
                    {s.averageDelayDays !== null ? `avg delay ${s.averageDelayDays.toFixed(1)}d · ` : ""}
                    {s.openOrders} open order{s.openOrders === 1 ? "" : "s"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
