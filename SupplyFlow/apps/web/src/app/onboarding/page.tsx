"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select } from "@/components/ui";
import { api } from "@/lib/client/format";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/v1/org", {
        method: "POST",
        body: JSON.stringify({ name, currency, timezone })
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">Create your organization</h1>
        <p className="mt-1 mb-6 text-[14px] text-ink-500">
          One workspace for your supply chain. You can invite teammates afterwards.
        </p>
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-ink-200 bg-white p-6 shadow-card">
          <Field label="Company name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Outdoors" required minLength={2} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Currency">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {["USD", "EUR", "GBP", "CNY", "JPY", "CAD", "AUD", "INR", "BRL", "MXN"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Timezone">
              <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC" />
            </Field>
          </div>
          {error ? <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
          <Button type="submit" disabled={busy} className="w-full h-10">
            {busy ? "Creating…" : "Create organization"}
          </Button>
        </form>
      </div>
    </main>
  );
}
