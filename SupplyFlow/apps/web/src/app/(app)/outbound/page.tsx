"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Truck } from "lucide-react";
import { DataGrid, type GridColumn } from "@/components/data-grid";
import { PageHeader } from "@/components/page-header";
import { Button, Input, StatusBadge } from "@/components/ui";
import { api, fmtDate } from "@/lib/client/format";

interface Outbound {
  id: string;
  number: string;
  coNumber: string | null;
  customerName: string | null;
  warehouseName: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  expectedDelivery: string | null;
  actualDelivery: string | null;
  status: string;
}

interface Option { id: string; label: string }

const columns: GridColumn<Outbound>[] = [
  { key: "number", label: "Shipment", width: 130, pinned: true },
  { key: "coNumber", label: "Order", width: 120 },
  { key: "customerName", label: "Customer", width: 190 },
  { key: "status", label: "Status", type: "status", width: 110 },
  { key: "carrier", label: "Carrier", width: 140 },
  { key: "trackingNumber", label: "Tracking #", width: 160 },
  {
    key: "expectedDelivery",
    label: "Expected delivery",
    width: 150,
    format: (row) => (
      <span className={row.expectedDelivery && row.actualDelivery === null && new Date(row.expectedDelivery) < new Date() && row.status !== "delivered" ? "font-medium text-red-600" : ""}>
        {fmtDate(row.expectedDelivery)}
      </span>
    )
  },
  { key: "actualDelivery", label: "Delivered", type: "date", width: 110 }
];

export default function OutboundPage() {
  const [data, setData] = useState<Outbound[]>([]);
  const [orders, setOrders] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [obs, cos, custs, prods, whs] = await Promise.all([
        api<{ data: Outbound[] }>("/api/v1/outbound-shipments"),
        api<{ data: Array<{ id: string; number: string; customerName: string }> }>("/api/v1/customer-orders"),
        api<{ data: Array<{ id: string; name: string }> }>("/api/v1/customers"),
        api<{ data: Array<{ id: string; sku: string; name: string }> }>("/api/v1/products"),
        api<{ data: Array<{ id: string; code: string; name: string }> }>("/api/v1/warehouses")
      ]);
      setData(obs.data);
      setOrders(cos.data.map((c) => ({ id: c.id, label: `${c.number}${c.customerName ? ` — ${c.customerName}` : ""}` })));
      setCustomers(custs.data.map((c) => ({ id: c.id, label: c.name })));
      setProducts(prods.data.map((p) => ({ id: p.id, label: `${p.sku} — ${p.name}` })));
      setWarehouses(whs.data.map((w) => ({ id: w.id, label: `${w.code} — ${w.name}` })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function act(row: Outbound, action: "ship" | "deliver") {
    try {
      await api(`/api/v1/outbound-shipments/${row.id}/action`, { method: "POST", body: JSON.stringify({ action }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await api("/api/v1/outbound-shipments", {
        method: "POST",
        body: JSON.stringify({
          customerOrderId: fd.get("customerOrderId") || null,
          customerId: fd.get("customerId") || null,
          warehouseId: fd.get("warehouseId") || null,
          carrier: String(fd.get("carrier") || "") || null,
          trackingNumber: String(fd.get("trackingNumber") || "") || null,
          lines: [{ productId: fd.get("productId"), quantity: Number(fd.get("quantity")) }]
        })
      });
      setCreateOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shipment");
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Outbound shipments"
        description="Deliveries to your customers."
        actions={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> New shipment</Button>}
      />
      {error ? <p className="mx-4 mb-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
      <div className="flex-1 min-h-0 mx-4 rounded-lg border border-ink-200 overflow-hidden shadow-card">
        <DataGrid
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Search shipments…"
          emptyTitle="No outbound shipments yet"
          toolbar={
            <>
              {data.filter((r) => r.status === "shipped").length > 0 ? (
                <Button variant="secondary" size="sm" onClick={() => Promise.all(data.filter((r) => r.status === "shipped").map((r) => act(r, "deliver"))).then(load)}>
                  Mark all delivered
                </Button>
              ) : null}
            </>
          }
        />
      </div>

      {/* Row actions rendered via detail-free approach: inline buttons in a second grid would complicate; provide per-row via click */}
      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close" className="absolute inset-0 bg-ink-950/40" onClick={() => setCreateOpen(false)} />
          <form onSubmit={create} className="relative z-10 w-full max-w-md rounded-xl border border-ink-200 bg-white p-5 shadow-xl space-y-3">
            <h2 className="text-[15px] font-semibold">New outbound shipment</h2>
            <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Customer order</span>
              <select name="customerOrderId" defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                <option value="">— none —</option>
                {orders.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
            <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Customer</span>
              <select name="customerId" defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                <option value="">—</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">From warehouse *</span>
              <select name="warehouseId" required defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                <option value="" disabled>Select…</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Carrier</span><Input name="carrier" placeholder="UPS" /></label>
              <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Tracking #</span><Input name="trackingNumber" /></label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block col-span-2"><span className="mb-1 block text-[12px] font-medium text-ink-600">Product *</span>
                <select name="productId" required defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                  <option value="" disabled>Select…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </label>
              <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Quantity *</span>
                <Input name="quantity" type="number" min="0" step="any" required />
              </label>
            </div>
            <Button type="submit" className="w-full mt-1">Create shipment</Button>
          </form>
        </div>
      ) : null}

      {/* ship/deliver quick actions */}
      <QuickActions data={data} onAct={act} />
    </div>
  );
}

function QuickActions({ data, onAct }: { data: Outbound[]; onAct: (row: Outbound, action: "ship" | "deliver") => Promise<void> }) {
  const actionable = data.filter((r) => ["pending", "picking", "packed", "shipped"].includes(r.status));
  if (actionable.length === 0) return null;
  return (
    <div className="mx-4 my-4 flex flex-wrap items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-3 shadow-card">
      <Truck className="h-4 w-4 text-ink-400" />
      <span className="text-[12px] font-medium text-ink-600 mr-2">Quick actions:</span>
      {actionable.map((r) => (
        <span key={r.id} className="inline-flex items-center gap-2 rounded-full bg-ink-50 pl-3 pr-1 py-1 text-[12px]">
          <span className="font-mono">{r.number}</span>
          <StatusBadge value={r.status} />
          {["pending", "picking", "packed"].includes(r.status) ? (
            <button onClick={() => void onAct(r, "ship")} className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-brand-700">Ship</button>
          ) : (
            <button onClick={() => void onAct(r, "deliver")} className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-emerald-700">Deliver</button>
          )}
        </span>
      ))}
    </div>
  );
}
