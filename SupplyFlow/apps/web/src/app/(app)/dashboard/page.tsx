"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageX, TrendingDown, Ship, Clock, Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { RiskDot } from "@/components/ui";
import { api, fmtMoney, fmtNum } from "@/lib/client/format";
import { cn } from "@/lib/client/cn";

interface Dashboard {
  kpis: {
    inventoryValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    openPoCount: number;
    committedSpend: number;
    lateInboundCount: number;
    incomingUnits: number;
    atRiskProducts: number;
    fulfillmentRate: number | null;
  };
  topRisk: Array<{ sku: string; name: string; risk: string; projected: number; recommendedOrderQty: number | null; supplierName: string | null }>;
  alerts: Array<{ id: string; severity: string; title: string; detail: string; entityType?: string; entityId?: string }>;
  suppliers: Array<{ supplierId: string; name: string; onTimeRate: number | null; shipments: number; openOrders: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api<{ data: Dashboard }>("/api/v1/dashboard");
        setData(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      }
    })();
  }, []);

  if (error) return <div className="p-6 text-[13px] text-red-600">{error}</div>;
  if (!data) return <div className="p-10 text-center text-[13px] text-ink-400">Loading your supply chain…</div>;

  const k = data.kpis;

  return (
    <div className="h-screen overflow-y-auto">
      <PageHeader title="Dashboard" description="Your supply chain at a glance." />

      <div className="mx-6 pb-8 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon={<Wallet className="h-4 w-4" />} label="Inventory value" value={fmtMoney(k.inventoryValue)} tone="neutral" />
          <Kpi
            icon={<TrendingDown className="h-4 w-4" />}
            label="Stock risks"
            value={`${k.atRiskProducts} products`}
            sub={<>Low {k.lowStockCount} · Out of stock {k.outOfStockCount}</>}
            tone={k.atRiskProducts > 0 ? "danger" : "good"}
            href="/planning"
          />
          <Kpi
            icon={<Clock className="h-4 w-4" />}
            label="Late inbound"
            value={`${k.lateInboundCount} shipments`}
            sub={`${fmtNum(k.incomingUnits)} units incoming`}
            tone={k.lateInboundCount > 0 ? "warning" : "neutral"}
            href="/inbound"
          />
          <Kpi
            icon={<Ship className="h-4 w-4" />}
            label="Open purchase orders"
            value={`${k.openPoCount}`}
            sub={`${fmtMoney(k.committedSpend)} committed`}
            tone="neutral"
            href="/purchasing"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-5">
          {/* Risk table */}
          <section className="rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
              <h2 className="text-[13px] font-semibold text-ink-800">Products needing attention</h2>
              <Link href="/planning" className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-700 hover:underline">
                Open planning <ArrowRight className="h-3 w-3" />
              </Link>
            </header>
            {data.topRisk.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <PackageX className="mx-auto h-5 w-5 text-emerald-500 mb-1.5" />
                <p className="text-[13px] text-emerald-700">All stock levels are healthy.</p>
              </div>
            ) : (
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100 bg-ink-50/50">
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-4 py-2 font-medium">Risk</th>
                    <th className="px-4 py-2 text-right font-medium">Projected</th>
                    <th className="px-4 py-2 text-right font-medium">Reorder</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRisk.map((r) => (
                    <tr key={r.sku} className="border-b border-ink-50 last:border-0 hover:bg-brand-50/30">
                      <td className="px-4 py-2">
                        <span className="font-mono text-[11px] text-ink-400 mr-2">{r.sku}</span>{r.name}
                        {r.supplierName ? <span className="block pl-0.5 text-[11px] text-ink-400">{r.supplierName}</span> : null}
                      </td>
                      <td className="px-4 py-2 capitalize whitespace-nowrap"><span className="inline-flex items-center"><RiskDot risk={r.risk} />{r.risk.replace(/_/g, " ")}</span></td>
                      <td className={cn("px-4 py-2 text-right tabular-nums", r.projected <= 0 ? "text-red-600 font-medium" : "")}>{Math.round(r.projected).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-medium text-brand-700">{r.recommendedOrderQty ? r.recommendedOrderQty.toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Right column */}
          <div className="space-y-5">
            <section className="rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
              <header className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
                <h2 className="text-[13px] font-semibold text-ink-800">Latest alerts</h2>
                <Link href="/alerts" className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-700 hover:underline">
                  All alerts <ArrowRight className="h-3 w-3" />
                </Link>
              </header>
              <ul className="divide-y divide-ink-50 max-h-64 overflow-y-auto">
                {data.alerts.length === 0 ? (
                  <li className="px-4 py-6 text-center text-[12px] text-emerald-600">No alerts — smooth sailing.</li>
                ) : data.alerts.map((a) => (
                  <li key={a.id} className="px-4 py-2.5 flex items-start gap-2.5">
                    <span className={cn("mt-1 h-1.5 w-1.5 rounded-full shrink-0", a.severity === "danger" ? "bg-red-500" : a.severity === "warning" ? "bg-amber-400" : "bg-blue-500")} />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium text-ink-800 truncate">{a.title}</p>
                      <p className="text-[11.5px] text-ink-500 truncate">{a.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
              <header className="px-4 py-3 border-b border-ink-100">
                <h2 className="text-[13px] font-semibold text-ink-800">Supplier performance</h2>
                <p className="text-[11px] text-ink-400">On-time delivery from completed shipments{data.kpis.fulfillmentRate !== null ? ` · fulfillment rate ${Math.round(data.kpis.fulfillmentRate * 100)}%` : ""}</p>
              </header>
              <ul className="divide-y divide-ink-50">
                {data.suppliers.length === 0 ? (
                  <li className="px-4 py-6 text-center text-[12px] text-ink-400">No shipment history yet.</li>
                ) : data.suppliers.map((s) => (
                  <li key={s.supplierId} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink-800">{s.name}</span>
                    <span className="w-28 h-1.5 rounded-full bg-ink-100 overflow-hidden shrink-0">
                      <span
                        className={cn("block h-full", (s.onTimeRate ?? 0) >= 0.9 ? "bg-emerald-500" : (s.onTimeRate ?? 0) >= 0.75 ? "bg-amber-400" : (s.onTimeRate === null ? "bg-transparent" : "bg-red-500"))}
                        style={{ width: `${(s.onTimeRate ?? 0) * 100}%` }}
                      />
                    </span>
                    <span className={cn("w-10 text-right tabular-nums text-[12px]", s.onTimeRate !== null && s.onTimeRate < 0.85 ? "text-red-600 font-medium" : "text-ink-700")}>
                      {s.onTimeRate !== null ? `${Math.round(s.onTimeRate * 100)}%` : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, sub, tone, href }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
  tone: "neutral" | "good" | "warning" | "danger";
  href?: string;
}) {
  const body = (
    <div className="group rounded-lg border border-ink-200 bg-white shadow-card p-4 transition-shadow hover:shadow-md cursor-pointer h-full">
      <div className="flex items-center gap-2 text-ink-400">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn(
        "mt-2 text-[20px] font-semibold tracking-tight",
        tone === "danger" ? "text-red-600" : tone === "warning" ? "text-amber-600" : tone === "good" ? "text-emerald-600" : "text-ink-900"
      )}>{value}</p>
      {sub ? <p className="mt-0.5 text-[11.5px] text-ink-400">{sub}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
