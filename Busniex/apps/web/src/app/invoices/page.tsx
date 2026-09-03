'use client';

import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { PageHeader, Table, Th, Td, Button, EmptyState, Badge } from '@businex/ui';

interface Invoice { id: string; number: string; direction: string; total: string; status: string; currency: string; createdAt: string }

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const rows = await api<Invoice[]>('/invoices'); setItems(rows); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const transition = async (id: string, to: string) => {
    await api(`/invoices/${id}/transition`, { method: 'POST', body: { to } });
    load();
  };

  return (
    <Shell>
      <PageHeader title="Invoices" subtitle="Universal invoicing — same entity, configurable workflow" />
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : items.length === 0 ? <EmptyState title="No invoices yet" description="Create an invoice via the API." /> : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm"><Table><thead><tr><Th>Number</Th><Th>Direction</Th><Th>Total</Th><Th>Status</Th><Th>Actions</Th></tr></thead><tbody className="divide-y divide-gray-100">{items.map((inv) => (
          <tr key={inv.id} className="hover:bg-gray-50"><Td className="font-medium">{inv.number}</Td><Td><Badge tone="blue">{inv.direction}</Badge></Td><Td>{Number(inv.total).toFixed(2)} {inv.currency}</Td><Td><Badge tone={inv.status === 'completed' ? 'green' : inv.status === 'cancelled' ? 'red' : 'amber'}>{inv.status}</Badge></Td><Td>{inv.status === 'draft' ? <Button size="sm" onClick={() => transition(inv.id, 'completed')}>Mark completed</Button> : inv.status === 'completed' ? <Button size="sm" variant="ghost" onClick={() => transition(inv.id, 'cancelled')}>Cancel</Button> : '—'}</Td></tr>
        ))}</tbody></Table></div>
      )}
    </Shell>
  );
}
