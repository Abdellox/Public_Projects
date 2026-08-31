"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/client/format";
import { cn } from "@/lib/client/cn";
import type { AlertItem } from "@supplyflow/types";

const ICONS = {
  danger: <ShieldAlert className="h-4.5 w-4.5 text-red-500" />,
  warning: <TriangleAlert className="h-4.5 w-4.5 text-amber-500" />,
  info: <AlertTriangle className="h-4.5 w-4.5 text-blue-500" />
};

const LINKS: Record<string, string> = {
  product: "/products",
  purchase_order: "/purchasing",
  inbound_shipment: "/inbound",
  customer_order: "/orders"
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    void (async () => {
      try {
        const res = await api<{ data: AlertItem[] }>("/api/v1/alerts");
        setAlerts(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = {
    all: alerts.length,
    danger: alerts.filter((a) => a.severity === "danger").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length
  };

  const visible = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className="h-screen overflow-y-auto">
      <PageHeader title="Alerts" description="Operational issues that need attention — each with context and a suggested action." />

      <div className="mx-6 mb-4 flex gap-2">
        {(["all", "danger", "warning", "info"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-medium capitalize transition-colors sf-focus-ring",
              filter === f ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
            )}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="mx-6 pb-8 space-y-3 max-w-3xl">
        {loading ? (
          <div className="rounded-lg border border-ink-200 bg-white p-10 text-center text-[13px] text-ink-400 shadow-card">Scanning your supply chain…</div>
        ) : visible.length === 0 ? (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-10 text-center">
            <p className="text-[14px] font-medium text-emerald-800">All clear</p>
            <p className="mt-1 text-[13px] text-emerald-600">No operational risks detected right now.</p>
          </div>
        ) : (
          visible.map((a) => {
            const href = a.entityType && LINKS[a.entityType] ? LINKS[a.entityType] : null;
            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-lg border bg-white p-4 shadow-card",
                  a.severity === "danger" ? "border-red-100" : a.severity === "warning" ? "border-amber-100" : "border-blue-100"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">{ICONS[a.severity]}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[14px] font-semibold text-ink-900">{a.title}</h2>
                    <p className="mt-0.5 text-[13px] text-ink-600">{a.detail}</p>
                    <dl className="mt-2 space-y-1 text-[12px] leading-relaxed">
                      <div><dt className="inline font-medium text-ink-500">Why it matters: </dt><dd className="inline text-ink-700">{a.whyItMatters}</dd></div>
                      <div><dt className="inline font-medium text-ink-500">What to do: </dt>
                        <dd className="inline text-ink-700">
                          {href && a.entityId ? (
                            <Link href={`${href}?focus=${a.entityId}`} className="text-brand-700 hover:underline">{a.suggestedAction}</Link>
                          ) : a.suggestedAction}
                        </dd>
                      </div>
                    </dl>
                    <span className="mt-2 inline-block rounded bg-ink-50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-400">{a.type}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
