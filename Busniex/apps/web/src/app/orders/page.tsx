'use client';

import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { PageHeader, Table, Th, Td, EmptyState, Badge } from '@businex/ui';

interface Order { id: string; number: string; total: string; status: string; currency: string; createdAt: string }

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setItems(await api<Order[]>('/crm/orders')); } catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <Shell>
      <PageHeader title="Sales Orders" subtitle="Orders placed by customers — reuse party, product, workflow" />
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : items.length === 0 ? <EmptyState title="No orders yet" description="Create a sales order via the API." /> : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm"><Table><thead><tr><Th>Number</Th><Th>Total</Th><Th>Status</Th><Th>Created</Th></tr></thead><tbody className="divide-y divide-gray-100">{items.map((o) => (
          <tr key={o.id} className="hover:bg-gray-50"><Td className="font-medium">{o.number}</Td><Td>{Number(o.total).toFixed(2)} {o.currency}</Td><Td><Badge tone={o.status === 'completed' ? 'green' : 'amber'}>{o.status}</Badge></Td><Td>{new Date(o.createdAt).toLocaleDateString()}</Td></tr>
        ))}</tbody></Table></div>
      )}
    </Shell>
  );
}
