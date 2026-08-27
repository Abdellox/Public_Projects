'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  Logo,
  Spinner,
} from '@nexora/ui';
import { apiGet, apiPost } from '@/lib/api';

interface MeResponse {
  user: { name: string; email: string };
  memberships: { organizationId: string; organizationName: string }[];
}

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const [state, setState] = useState<'checking' | 'ready' | 'joining' | 'done' | 'error'>(
    'checking',
  );
  const [message, setMessage] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiGet<MeResponse>('/v1/auth/me')
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
      .finally(() => setState('ready'));
  }, [token]);

  async function accept() {
    if (!token) return;
    setState('joining');
    try {
      const res = await apiPost<{
        membership: { organizationName: string };
      }>('/v1/invitations/accept', { token });
      setState('done');
      setMessage(res.membership.organizationName);
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Could not accept invitation');
    }
  }

  if (state === 'checking') {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  if (state === 'done') {
    return (
      <Center>
        <Card className="w-full max-w-sm p-8 text-center">
          <Badge tone="green">Welcome aboard</Badge>
          <h1 className="mt-3 text-xl font-semibold">You joined {message}</h1>
          <Button className="mt-6 w-full" onClick={() => router.push('/app')}>
            Go to your workspace
          </Button>
        </Card>
      </Center>
    );
  }

  if (state === 'error') {
    return (
      <Center>
        <Card className="w-full max-w-sm p-8 text-center">
          <Badge tone="red">Invitation problem</Badge>
          <p className="mt-3 text-sm text-neutral-600">{message}</p>
          <Link href="/app" className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline">
            Go to dashboard
          </Link>
        </Card>
      </Center>
    );
  }

  return (
    <Center>
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold">You have been invited</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Accept this invitation to join your team&apos;s workspace.
        </p>
        {authed ? (
          <Button
            className="mt-6 w-full"
            loading={state === 'joining'}
            onClick={accept}
          >
            Accept invitation
          </Button>
        ) : (
          <>
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Sign in with the email address this invitation was sent to, then
              reopen this link.
            </p>
            <Link href="/login" className="mt-4 block">
              <Button variant="secondary" className="w-full">
                Sign in first
              </Button>
            </Link>
          </>
        )}
      </Card>
    </Center>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {children}
    </div>
  );
}
