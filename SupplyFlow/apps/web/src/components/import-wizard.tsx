"use client";

import { useRef, useState } from "react";
import { X, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button, Spinner } from "@/components/ui";
import { api } from "@/lib/client/format";
import { cn } from "@/lib/client/cn";

interface ParseResult {
  filename: string;
  headers: string[];
  rowCount: number;
  truncated?: boolean;
  preview: Record<string, string>[];
  rows: Record<string, string>[];
}

interface CommitReport {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  results: Array<{ row: number; status: string; message?: string }>;
}

const TARGET_FIELDS: Record<string, Array<{ value: string; label: string; required?: boolean }>> = {
  products: [
    { value: "sku", label: "SKU *", required: true },
    { value: "name", label: "Name *", required: true },
    { value: "description", label: "Description" },
    { value: "unit", label: "Unit" },
    { value: "barcode", label: "Barcode" },
    { value: "cost_price", label: "Cost price" },
    { value: "selling_price", label: "Selling price" },
    { value: "min_stock", label: "Min stock" },
    { value: "max_stock", label: "Max stock" },
    { value: "reorder_point", label: "Reorder point" },
    { value: "reorder_quantity", label: "Reorder qty" },
    { value: "lead_time_days", label: "Lead time (days)" }
  ],
  suppliers: [
    { value: "code", label: "Code" },
    { value: "name", label: "Name *", required: true },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "city", label: "City" },
    { value: "country", label: "Country" },
    { value: "payment_terms", label: "Payment terms" },
    { value: "lead_time_days", label: "Lead time (days)" }
  ],
  customers: [
    { value: "code", label: "Code" },
    { value: "name", label: "Name *", required: true },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "city", label: "City" },
    { value: "country", label: "Country" }
  ]
};

const STEPS = ["Upload file", "Map columns", "Review & import", "Report"];

export function ImportWizard({ open, onClose, entity, onDone }: {
  open: boolean;
  onClose: () => void;
  entity: "products" | "suppliers" | "customers";
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"upsert" | "create_only">("upsert");
  const [report, setReport] = useState<CommitReport | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/v1/import/parse", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      setParsed((body as { data: ParseResult }).data);
      autoMap((body as { data: ParseResult }).data.headers);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function autoMap(headers: string[]) {
    const targets = TARGET_FIELDS[entity];
    const m: Record<string, string> = {};
    for (const h of headers) {
      const norm = h.toLowerCase().replace(/[\s-]+/g, "_").replace(/[^a-z_]/g, "");
      const match =
        targets.find((t) => t.value === norm) ??
        targets.find((t) => t.value === h.toLowerCase().replace(/\s+/g, "")) ??
        targets.find((t) => t.label.replace(/[^a-z]/gi, "").toLowerCase() === h.toLowerCase().replace(/[^a-z]/gi, "")) ??
        targets.find((t) => t.value.includes(norm) && norm.length > 2);
      if (match) m[h] = match.value;
    }
    setMappings(m);
  }

  async function commit() {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ data: CommitReport }>("/api/v1/import/commit", {
        method: "POST",
        body: JSON.stringify({
          entity,
          mode,
          mappings,
          rows: parsed.rows.map((r) => Object.fromEntries(Object.entries(r)))
        })
      });
      setReport(res.data);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep(0);
    setParsed(null);
    setMappings({});
    setReport(null);
    setError(null);
  }

  function finish() {
    onDone();
    reset();
    onClose();
  }

  const missingRequired = (TARGET_FIELDS[entity] ?? []).filter((t) => t.required && !Object.values(mappings).includes(t.value));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button aria-label="Close" className="absolute inset-0 bg-ink-950/40" onClick={step === 3 ? finish : onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl flex flex-col">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <div>
            <h2 className="text-[15px] font-semibold text-ink-900">Import {entity}</h2>
            <ol className="mt-1 flex gap-1.5 text-[11px] text-ink-400">
              {STEPS.map((s, i) => (
                <li key={s} className={cn("px-1.5 py-0.5 rounded", i === step ? "bg-brand-50 text-brand-700 font-medium" : i < step ? "text-brand-600" : "")}>
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
          </div>
          <button onClick={step === 3 ? finish : onClose} className="rounded p-1 text-ink-400 hover:bg-ink-100 sf-focus-ring">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="mb-3 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
          ) : null}

          {step === 0 ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) void upload(f);
              }}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/50 py-14 cursor-pointer hover:border-brand-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {busy ? <Spinner className="h-6 w-6 text-brand-600" /> : <Upload className="h-8 w-8 text-ink-300 mb-2" />}
              <p className="text-[13px] font-medium text-ink-700">Drop a CSV or XLSX file here, or click to browse</p>
              <p className="mt-1 text-[12px] text-ink-400">Max 8 MB · up to 2000 rows</p>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
            </div>
          ) : null}

          {step === 1 && parsed ? (
            <div className="space-y-4">
              <div className="rounded-md bg-ink-50 border border-ink-100 px-3 py-2 text-[12px] text-ink-600">
                <strong>{parsed.filename}</strong> — {parsed.rowCount.toLocaleString()} rows detected.
                {missingRequired.length > 0 ? (
                  <span className="ml-1 text-amber-600">Missing required mapping: {missingRequired.map((m) => m.label).join(", ")}</span>
                ) : (
                  <span className="ml-1 text-emerald-600">All required columns mapped.</span>
                )}
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-ink-500">
                    <th className="py-1.5 pr-3 font-medium">File column</th>
                    <th className="py-1.5 font-medium">Maps to field</th>
                    <th className="py-1.5 pl-3 font-medium">Sample values</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.headers.map((h) => (
                    <tr key={h} className="border-b border-ink-50">
                      <td className="py-1.5 pr-3 font-medium text-ink-800">{h}</td>
                      <td className="py-1.5">
                        <select
                          value={mappings[h] ?? ""}
                          onChange={(e) => setMappings((m) => ({ ...m, [h]: e.target.value }))}
                          className="h-7 rounded border border-ink-200 px-1.5 text-[12px]"
                        >
                          <option value="">— ignore —</option>
                          {(TARGET_FIELDS[entity] ?? []).map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1.5 pl-3 text-ink-500 truncate max-w-[240px]">
                        {parsed.preview.slice(0, 3).map((r) => r[h]).filter(Boolean).join(" · ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {step === 2 && parsed ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] text-ink-700">
                <input type="checkbox" checked={mode === "upsert"} onChange={(e) => setMode(e.target.checked ? "upsert" : "create_only")} />
                Update existing records that match ({entity === "products" ? "by SKU" : "by code or name"})
              </label>
              <div className="overflow-auto rounded-md border border-ink-100 max-h-72">
                <table className="w-full text-[12px]">
                  <thead className="bg-ink-50 sticky top-0">
                    <tr className="text-left text-ink-500">
                      {Object.values(mappings).filter(Boolean).map((field) => (
                        <th key={field} className="px-2 py-1.5 font-medium">{field}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.preview.map((row, i) => (
                      <tr key={i} className="border-t border-ink-50">
                        {Object.values(mappings).filter(Boolean).map((field) => (
                          <td key={field} className="px-2 py-1 truncate max-w-[180px]">{String(row[field] ?? "") || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[12px] text-ink-400">Showing first {Math.min(50, parsed.rowCount)} of {parsed.rowCount} rows. Rows failing validation are reported and skipped — data is never silently corrupted.</p>
            </div>
          ) : null}

          {step === 3 && report ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Created", value: report.created, cls: "text-emerald-600" },
                  { label: "Updated", value: report.updated, cls: "text-blue-600" },
                  { label: "Skipped", value: report.skipped, cls: "text-amber-600" },
                  { label: "Errors", value: report.errors, cls: "text-red-600" }
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-ink-100 bg-white px-3 py-3 text-center">
                    <p className={cn("text-xl font-semibold tabular-nums", s.cls)}>{s.value}</p>
                    <p className="text-[11px] uppercase tracking-wide text-ink-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {report.errors + report.skipped > 0 ? (
                <div className="max-h-48 overflow-auto rounded-md border border-ink-100">
                  <table className="w-full text-[12px]">
                    <thead className="bg-ink-50 sticky top-0"><tr><th className="px-2 py-1.5 text-left text-ink-500 font-medium">Row</th><th className="px-2 py-1.5 text-left text-ink-500 font-medium">Status</th><th className="px-2 py-1.5 text-left text-ink-500 font-medium">Detail</th></tr></thead>
                    <tbody>
                      {report.results.filter((r) => r.status !== "created" && r.status !== "updated").map((r) => (
                        <tr key={r.row} className="border-t border-ink-50">
                          <td className="px-2 py-1 tabular-nums">{r.row}</td>
                          <td className="px-2 py-1">
                            {r.status === "error" ? <span className="inline-flex items-center gap-1 text-red-600"><AlertTriangle className="h-3 w-3" /> error</span> : <span className="inline-flex items-center gap-1 text-amber-600">skipped</span>}
                          </td>
                          <td className="px-2 py-1 text-ink-600 truncate">{r.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="flex items-center gap-1.5 text-[13px] text-emerald-600"><CheckCircle2 className="h-4 w-4" /> All rows imported cleanly.</p>
              )}
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-ink-100 px-5 py-3.5">
          <Button variant="ghost" size="sm" onClick={reset}>Start over</Button>
          <div className="flex gap-2">
            {step === 1 ? (
              <Button size="sm" disabled={missingRequired.length > 0} onClick={() => setStep(2)}>Continue</Button>
            ) : null}
            {step === 2 ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setStep(1)}>Back</Button>
                <Button size="sm" disabled={busy} onClick={() => void commit()}>
                  {busy ? <Spinner className="mr-1.5 h-3.5 w-3.5" /> : null}
                  Import {parsed?.rowCount} rows
                </Button>
              </>
            ) : null}
            {step === 3 ? <Button size="sm" onClick={finish}>Done</Button> : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
