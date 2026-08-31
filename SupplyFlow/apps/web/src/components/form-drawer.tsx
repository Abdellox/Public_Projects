"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button, Field, Input, Select, Spinner } from "@/components/ui";
import { cn } from "@/lib/client/cn";

export interface FormFieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "money" | "date" | "datetime-local" | "select" | "textarea";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: string | number;
  hint?: string;
  placeholder?: string;
  span?: 1 | 2;
}

interface FormDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FormFieldDef[];
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

export function FormDrawer({ open, onClose, title, description, fields, submitLabel = "Save", onSubmit }: FormDrawerProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(values);
      setValues({});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  const initial = (f: FormFieldDef) => String(values[f.key] ?? f.defaultValue ?? "");

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button aria-label="Close" className="absolute inset-0 bg-ink-950/30 backdrop-blur-[2px]" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl border-l border-ink-200 animate-in"
        style={{ animation: "slideIn .18s ease-out" }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(24px); opacity: .6 } to { transform: none; opacity: 1 } }`}</style>
        <header className="flex items-start justify-between px-5 py-4 border-b border-ink-100">
          <div>
            <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
            {description ? <p className="mt-0.5 text-[12px] text-ink-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700 sf-focus-ring">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {fields.map((f) => (
              <div key={f.key} className={cn(f.span === 2 && "col-span-2")}>
                <Field label={f.label} hint={f.hint}>
                  {f.type === "select" ? (
                    <Select value={initial(f)} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} required={f.required}>
                      <option value="">Select…</option>
                      {(f.options ?? []).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      className="min-h-[72px] w-full rounded-md border border-ink-200 px-3 py-2 text-[13px] sf-focus-ring"
                      value={initial(f)}
                      placeholder={f.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      required={f.required}
                    />
                  ) : (
                    <Input
                      type={f.type === "money" || f.type === "number" ? "number" : f.type ?? "text"}
                      step={f.type === "money" ? "0.01" : undefined}
                      min={f.type === "number" || f.type === "money" ? 0 : undefined}
                      value={initial(f)}
                      placeholder={f.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      required={f.required}
                    />
                  )}
                </Field>
              </div>
            ))}
          </div>
          {error ? <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-ink-100 px-5 py-3.5">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>
            {busy ? <Spinner className="mr-1.5 h-3.5 w-3.5" /> : null}
            {submitLabel}
          </Button>
        </footer>
      </form>
    </div>
  );
}
