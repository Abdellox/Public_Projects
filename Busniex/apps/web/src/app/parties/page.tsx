'use client';

import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { PageHeader, Table, Th, Td, Button, EmptyState, Badge } from '@businex/ui';

interface Party {
  id: string;
  name: string;
  kind: string;
  emails: { address: string }[];
  createdAt: string;
}

export default function PartiesPage() {
  const [items, setItems] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState('organization');

  const load = async () => {
    try {
      const rows = await api<Party[]>('/parties');
      setItems(rows);
    } catch {
      /* unauthenticated */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api('/parties', {
      method: 'POST',
      body: { name, kind, emails: [], phones: [], addresses: [] },
    });
    setName('');
    setShowForm(false);
    load();
  };

  return (
    <Shell>
      <PageHeader
        title="Parties"
        subtitle="Customers, suppliers and contacts — one canonical entity with roles"
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : '+ Add party'}</Button>}
      />
      {showForm ? (
        <form onSubmit={create} className="mb-6 flex items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Kind</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="organization">Organization</option>
              <option value="person">Person</option>
            </select>
          </label>
          <Button type="submit">Create</Button>
        </form>
      ) : null}
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState title="No parties yet" description="Create a customer, supplier or partner to get started." />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Kind</Th>
                <Th>Email</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <Td className="font-medium">{p.name}</Td>
                  <Td><Badge tone={p.kind === 'person' ? 'blue' : 'green'}>{p.kind}</Badge></Td>
                  <Td>{p.emails?.[0]?.address ?? '—'}</Td>
                  <Td>{new Date(p.createdAt).toLocaleDateString()}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Shell>
  );
}
