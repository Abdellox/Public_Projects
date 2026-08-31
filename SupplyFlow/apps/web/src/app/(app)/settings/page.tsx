"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button, Input, Select, StatusBadge } from "@/components/ui";
import { api, fmtDate } from "@/lib/client/format";

interface Org { id: string; name: string; slug: string; currency: string; timezone: string; createdAt: string }

export default function SettingsPage() {
  const [org, setOrg] = useState<Org | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api<{ data: Org }>("/api/v1/org");
        setOrg(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      }
    })();
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await api<{ data: Org }>("/api/v1/org", {
        method: "PATCH",
        body: JSON.stringify({
          name: fd.get("name"),
          currency: fd.get("currency"),
          timezone: fd.get("timezone")
        })
      });
      setOrg(res.data);
      setMessage("Organization updated.");
    } catch (err) {
      if (err instanceof Error && err.message.includes("permission")) setForbidden(true);
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-screen overflow-y-auto">
      <PageHeader title="Settings" description="Workspace profile and regional defaults." />
      <div className="mx-6 pb-8 max-w-xl space-y-4">
        {error ? <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
        {message ? <p className="text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{message}</p> : null}

        {!org ? (
          <p className="text-[13px] text-ink-400">Loading…</p>
        ) : (
          <form onSubmit={save} className="space-y-3 rounded-lg border border-ink-200 bg-white p-5 shadow-card">
            <h2 className="text-[13px] font-semibold text-ink-800">Organization</h2>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-ink-600">Name</span>
              <Input name="name" defaultValue={org.name} required disabled={forbidden} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-ink-600">Currency (ISO 4217)</span>
              <Select name="currency" defaultValue={org.currency}>
                {["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CNY", "INR", "BRL", "MXN", "SEK", "CHF"].map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-ink-600">Timezone (IANA)</span>
              <Input name="timezone" defaultValue={org.timezone} placeholder="America/New_York" required />
            </label>
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={saving || forbidden}>{saving ? "Saving…" : "Save changes"}</Button>
              {forbidden ? <span className="text-[12px] text-ink-500">Only owners and admins can edit these.</span> : null}
            </div>
          </form>
        )}

        {org ? (
          <div className="rounded-lg border border-ink-200 bg-white p-5 shadow-card">
            <h2 className="text-[13px] font-semibold text-ink-800">Workspace details</h2>
            <dl className="mt-2 space-y-1.5 text-[12.5px]">
              <div className="flex justify-between"><dt className="text-ink-500">Slug</dt><dd><code className="font-mono">{org.slug}</code></dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Created</dt><dd>{fmtDate(org.createdAt)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Plan</dt><dd><StatusBadge value="open-source" /></dd></div>
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
