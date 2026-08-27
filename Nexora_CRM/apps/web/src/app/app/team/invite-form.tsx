'use client';

import { useState } from 'react';
import { Button, Field, FormError, Input, Select } from '@nexora/ui';
import { apiPost } from '@/lib/api';

interface RoleRow {
  id: string;
  key: string;
  name: string;
}

export function InviteForm({
  base,
  roles,
  onDone,
}: {
  base: string;
  roles: RoleRow[];
  onDone: () => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState(roles[0]?.id ?? '');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInviteLink(null);
    setLoading(true);
    try {
      const res = await apiPost<{ token: string }>(`${base}/invitations`, {
        email,
        roleId,
      });
      setInviteLink(`${window.location.origin}/invite/${res.token}`);
      setEmail('');
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send invitation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end"
      >
        <Field label="Invite a teammate">
          <Input
            type="email"
            required
            placeholder="teammate@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Role">
          <Select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" loading={loading}>
          Invite
        </Button>
      </form>
      <FormError message={error} />
      {inviteLink ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <code className="min-w-0 flex-1 truncate text-xs text-emerald-900">
            {inviteLink}
          </code>
          <button
            type="button"
            className="shrink-0 rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
            onClick={async () => {
              await navigator.clipboard.writeText(inviteLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
