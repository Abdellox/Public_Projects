"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Department } from "@nexora/types";
import { useOrg } from "@/components/shell/org-context";
import { clientApi, ApiError } from "@/lib/api";
import {
  Button,
} from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card, EmptyState, ErrorNote } from "@/components/ui/card";
import { Badge } from "@/components/ui/avatar";
import { BuildingIcon, PlusIcon } from "@/components/icons";

export default function DepartmentsPage() {
  const { membership } = useOrg();
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const orgId = membership?.organization.id;

  const load = useCallback(async () => {
    if (!orgId) return;
    try {
      setDepartments(await clientApi<Department[]>(`/organizations/${orgId}/departments`));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load departments");
    }
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!orgId) return <EmptyState title="Join an organization first" />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Departments</h1>
          <p className="mt-1 text-sm text-ink-500">
            Every department is a world of its own — members, teams and knowledge.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon width={16} height={16} /> New department
        </Button>
      </header>

      <ErrorNote message={error ?? ""} />

      {!departments ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          icon={<BuildingIcon width={28} height={28} />}
          title="No departments yet"
          description="Give your organization its shape by creating the first department."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              <div aria-hidden className="h-1.5 w-full" style={{ backgroundColor: d.color }} />
              <div className="p-5">
                <h3 className="text-sm font-semibold text-ink-950">{d.name}</h3>
                {d.description ? (
                  <p className="mt-1 line-clamp-2 text-[13px] text-ink-500">{d.description}</p>
                ) : null}
                <div className="mt-4 flex items-center gap-2">
                  <Badge tone="brand">{d.memberCount} members</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateDepartmentModal
        open={createOpen}
        orgId={orgId}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          void load();
        }}
      />
    </div>
  );
}

function CreateDepartmentModal({
  open,
  onClose,
  onCreated,
  orgId
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  orgId: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    try {
      await clientApi(`/organizations/${orgId}/departments`, {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          description: String(form.get("description") ?? "") || undefined,
          color: String(form.get("color") ?? "#6366f1")
        })
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create department");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a department">
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorNote message={error ?? ""} />
        <Field label="Name" htmlFor="dept-name">
          <Input id="dept-name" name="name" required placeholder="Engineering" autoFocus />
        </Field>
        <Field label="Description" htmlFor="dept-desc">
          <Textarea id="dept-desc" name="description" placeholder="What does this department own?" />
        </Field>
        <Field label="Color" htmlFor="dept-color" hint="Used as the department accent across the app.">
          <input
            id="dept-color"
            name="color"
            type="color"
            defaultValue="#6366f1"
            className="h-10 w-20 cursor-pointer rounded-lg border border-ink-200 bg-white p-1"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
