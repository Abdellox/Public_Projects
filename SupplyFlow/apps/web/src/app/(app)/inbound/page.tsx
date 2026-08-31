"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataGrid, type GridColumn } from "@/components/data-grid";
import { PageHeader } from "@/components/page-header";
import { Button, Input } from "@/components/ui";
import { api, fmtDate } from "@/lib/client/format";

interface Inbound {
  id: string;
  number: string;
  poNumber: string | null;
  supplierName: string;
  warehouseName: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  expectedArrival: string | null;
  actualArrival: string | null;
  status: string;
}

interface ShipmentLine { id: string; sku: string; productName: string; quantityExpected: number; quantityReceived: number }
interface Option { id: string; label: string }

function isLate(row: Inbound): boolean {
  return ["pending", "in_transit", "arrived"].includes(row.status) && row.expectedArrival !== null && new Date(row.expectedArrival) < new Date();
}

const columns: GridColumn<Inbound>[] = [
  { key: "number", label: "Shipment", width: 130, pinned: true },
  { key: "poNumber", label: "PO", width: 120 },
  { key: "supplierName", label: "Supplier", width: 190 },
  { key: "carrier", label: "Carrier", width: 140 },
  { key: "trackingNumber", label: "Tracking #", width: 160 },
  {
    key: "expectedArrival",
    label: "Expected",
    width: 120,
    format: (row) => (
      <span className={isLate(row) ? "font-medium text-red-600" : ""}>
        {fmtDate(row.expectedArrival)}{isLate(row) ? " · late" : ""}
      </span>
    )
  },
  { key: "actualArrival", label: "Actual arrival", type: "date", width: 120 },
  { key: "status", label: "Status", type: "status", width: 120 }
];

export default function InboundPage() {
  const [data, setData] = useState<Inbound[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [products, setProducts] = useState<Array<Option & {}>>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [receiving, setReceiving] = useState<{ shipmentId: string; number: string } | null>(null);
  const [receiveLines, setReceiveLines] = useState<ShipmentLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [ship, sups, whs, prods] = await Promise.all([
        api<{ data: Inbound[] }>("/api/v1/inbound-shipments"),
        api<{ data: Array<{ id: string; name: string }> }>("/api/v1/suppliers"),
        api<{ data: Array<{ id: string; code: string; name: string }> }>("/api/v1/warehouses"),
        api<{ data: Array<{ id: string; sku: string; name: string }> }>("/api/v1/products")
      ]);
      setData(ship.data);
      setSuppliers(sups.data.map((s) => ({ id: s.id, label: s.name })));
      setWarehouses(whs.data.map((w) => ({ id: w.id, label: `${w.code} — ${w.name}` })));
      setProducts(prods.data.map((p) => ({ id: p.id, label: `${p.sku} — ${p.name}` })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function openReceive(row: Inbound) {
    const res = await api<{ data: { lines: ShipmentLine[] } }>(`/api/v1/inbound-shipments/${row.id}`);
    setReceiveLines(res.data.lines.filter((l) => l.quantityReceived < l.quantityExpected));
    setReceiving({ shipmentId: row.id, number: row.number });
  }

  async function createShipment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await api("/api/v1/inbound-shipments", {
        method: "POST",
        body: JSON.stringify({
          supplierId: fd.get("supplierId"),
          warehouseId: fd.get("warehouseId") || null,
          carrier: String(fd.get("carrier") || "") || null,
          trackingNumber: String(fd.get("trackingNumber") || "") || null,
          expectedArrival: fd.get("expected") ? new Date(String(fd.get("expected"))).toISOString() : null,
          status: fd.get("status"),
          lines: [{ productId: fd.get("productId"), quantityExpected: Number(fd.get("quantity")) }]
        })
      });
      setCreateOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shipment");
    }
  }

  async function confirmReceive() {
    if (!receiving) return;
    try {
      await api(`/api/v1/inbound-shipments/${receiving.shipmentId}/receive`, {
        method: "POST",
        body: JSON.stringify({ lines: receiveLines.map((l) => ({ lineId: l.id, quantityReceived: l.quantityExpected - l.quantityReceived })) })
      });
      setReceiving(null);
      setError(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Receiving failed");
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Inbound shipments"
        description="Incoming goods and their delivery promises."
        actions={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> Record shipment</Button>}
      />
      {error ? <p className="mx-4 mb-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
      <div className="flex-1 min-h-0 mx-4 rounded-lg border border-ink-200 overflow-hidden shadow-card">
        <DataGrid
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Search shipments…"
          onRowClick={(row) => { if (["pending", "in_transit", "arrived"].includes(row.status)) void openReceive(row); }}
          emptyTitle="No inbound shipments"
          emptyDescription="Shipments created against purchase orders appear here."
        />
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close" className="absolute inset-0 bg-ink-950/40" onClick={() => setCreateOpen(false)} />
          <form onSubmit={createShipment} className="relative z-10 w-full max-w-md rounded-xl border border-ink-200 bg-white p-5 shadow-xl space-y-3">
            <h2 className="text-[15px] font-semibold">Record inbound shipment</h2>
            <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Supplier *</span>
              <select name="supplierId" required defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                <option value="" disabled>Select…</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Destination warehouse</span>
              <select name="warehouseId" defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                <option value="">—</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Carrier</span><Input name="carrier" placeholder="DHL" /></label>
              <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Tracking #</span><Input name="trackingNumber" /></label>
              <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Expected arrival</span><Input name="expected" type="datetime-local" /></label>
              <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Status</span>
                <select name="status" defaultValue="in_transit" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                  <option value="pending">Pending</option>
                  <option value="in_transit">In transit</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block col-span-2"><span className="mb-1 block text-[12px] font-medium text-ink-600">Product *</span>
                <select name="productId" required defaultValue="" className="h-9 w-full rounded-md border border-ink-200 px-2.5 text-[13px]">
                  <option value="" disabled>Select…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </label>
              <label className="block"><span className="mb-1 block text-[12px] font-medium text-ink-600">Quantity expected *</span>
                <Input name="quantity" type="number" min="0" step="any" required />
              </label>
            </div>
            <Button type="submit" className="w-full mt-1">Create shipment</Button>
          </form>
        </div>
      ) : null}

      {receiving ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close" className="absolute inset-0 bg-ink-950/40" onClick={() => setReceiving(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-ink-200 bg-white p-5 shadow-xl">
            <h2 className="text-[15px] font-semibold">Receive goods — {receiving.number}</h2>
            <p className="mt-0.5 mb-3 text-[12px] text-ink-500">Confirm quantities received into the destination warehouse. Stock and linked POs update automatically.</p>
            <table className="w-full text-[12px] mb-4">
              <thead><tr className="text-left text-ink-400 border-b border-ink-100"><th className="py-1.5 font-medium">Product</th><th className="text-right font-medium">Outstanding</th></tr></thead>
              <tbody>
                {receiveLines.map((l) => (
                  <tr key={l.id} className="border-b border-ink-50">
                    <td className="py-1.5"><span className="font-mono text-[11px] text-ink-400 mr-1.5">{l.sku}</span>{l.productName}</td>
                    <td className="text-right tabular-nums">{(l.quantityExpected - l.quantityReceived).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setReceiving(null)}>Cancel</Button>
              <Button size="sm" disabled={receiveLines.length === 0} onClick={() => void confirmReceive()}>
                Receive into stock
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
