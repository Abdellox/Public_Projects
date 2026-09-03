'use client';

import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { PageHeader, Table, Th, Td, EmptyState } from '@businex/ui';

interface Item { id: string; productId: string; locationId: string; quantityOnHand: string; reservedQuantity: string; availableQuantity: string }

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setItems(await api<Item[]>('/inventory/items')); } catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <Shell>
      <PageHeader title="Inventory" subtitle="Stock levels per product at each warehouse location" />
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : items.length === 0 ? <EmptyState title="No inventory items yet" description="Seed the database or create inventory items via the API." /> : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm"><Table><thead><tr><Th>Product</Th><Th>On Hand</Th><Th>Reserved</Th><Th>Available</Th></tr></thead><tbody className="divide-y divide-gray-100">{items.map((i) => (
          <tr key={i.id} className="hover:bg-gray-50"><Td className="font-mono text-xs">{i.productId.slice(0, 8)}…</Td><Td>{Number(i.quantityOnHand)}</Td><Td>{Number(i.reservedQuantity)}</Td><Td>{Number(i.availableQuantity)}</Td></tr>
        ))}</tbody></Table></div>
      )}
    </Shell>
  );
}
