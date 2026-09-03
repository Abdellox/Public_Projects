"use client";

import { useEffect, useRef, useState } from "react";
import { api, apiUpload } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Button, Card, CardHeader, EmptyState, ErrorBanner, Modal, Input, Select, Spinner, Table, Badge, Field } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  category: string;
  expiresAt: string | null;
  archivedAt: string | null;
  uploaderName?: string;
  versionCount?: number;
  ownerName?: string;
}

interface OrgSetting {
  documentStorage: { maxFileSizeMB: number; allowedExtensions: string[] };
}

export default function DocumentsPage() {
  const { can } = useSession();
  const [items, setItems] = useState<Document[]>([]);
  const [active, setActive] = useState<"active" | "archived">("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: "", category: "OTHER" });
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      const res = await api<{ data: Document[] }>(`/documents?includeArchived=${active === "archived"}`);
      setItems(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [active]);

  async function upload() {
    if (!fileRef.current?.files?.[0]) {
      setError("Please choose a file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", fileRef.current.files[0]);
    fd.append("title", form.title || fileRef.current.files[0].name);
    fd.append("category", form.category);
    try {
      await apiUpload("/documents", fd);
      setUploadOpen(false);
      setForm({ title: "", category: "OTHER" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function archive(id: string) {
    if (!confirm("Archive this document?")) return;
    try {
      await api(`/documents/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not archive");
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load documents" description={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Documents</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {items.length} {active} document{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5">
            {(["active", "archived"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                  active === tab ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {can("document.create") && <Button onClick={() => setUploadOpen(true)}>Upload</Button>}
        </div>
      </div>

      <Card>
        {items.length === 0 ? (
          <EmptyState title="No documents here" description="Upload documents for your team, or check the other tab." />
        ) : (
          <Table head={["Name", "Category", "Expires", "Owner", "Versions", ""]}>
            {items.map((d) => (
              <tr key={d.id} className="transition hover:bg-zinc-50">
                <td className="px-5 py-3">
                  <a href={`/api/v1/documents/${d.id}/download`} className="font-medium text-zinc-800 hover:text-brand-600">
                    {d.title}
                  </a>
                </td>
                <td className="px-5 py-3"><Badge tone="gray">{d.category}</Badge></td>
                <td className="px-5 py-3 text-sm text-zinc-600">
                  {d.expiresAt ? (
                    new Date(d.expiresAt) < new Date() ? (
                      <Badge tone="red">Expired {formatDate(d.expiresAt)}</Badge>
                    ) : (
                      formatDate(d.expiresAt)
                    )
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3 text-sm text-zinc-600">{d.ownerName ?? "—"}</td>
                <td className="px-5 py-3 text-sm text-zinc-600">{d.versionCount ?? 1}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => void archive(d.id)} className="text-xs font-medium text-red-600 hover:underline">
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload document">
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Employment contract — Jane Doe" />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {["OTHER", "CONTRACT", "POLICY", "CERTIFICATE", "PERSONAL_DATA"].map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </Select>
          </Field>
          <Field label="File" hint="PDF, images or office documents up to 25MB.">
            <input ref={fileRef} type="file" className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={() => void upload()} loading={uploading}>Upload</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
