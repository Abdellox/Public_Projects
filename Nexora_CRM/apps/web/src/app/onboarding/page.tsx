'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Field, FormError, Input, Logo } from '@nexora/ui';
import { apiGet, apiPost } from '@/lib/api';

interface MeResponse {
  user: { name: string };
  memberships: { organizationId: string }[];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [checkedSession, setCheckedSession] = useState(false);
  const [name, setName] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<MeResponse>('/v1/auth/me')
      .then((me) => {
        if (me.memberships.length > 0) {
          router.replace('/app');
          return;
        }
        setCheckedSession(true);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(name));
  }, [name, slugEdited]);

  if (!checkedSession) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiPost('/v1/organizations', {
        name,
        ...(slug ? { slug } : {}),
      });
      router.push('/app');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create workspace');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <Card className="w-full max-w-md p-8">
        <h1 className="text-xl font-semibold text-neutral-900">
          Create your organization
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          This will be your company&apos;s workspace. You become its owner.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormError message={error} />
          <Field label="Organization name">
            <Input
              required
              placeholder="Acme Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Workspace URL slug" hint="Lowercase letters, numbers and hyphens.">
            <Input
              placeholder="acme"
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value);
              }}
            />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Create organization
          </Button>
        </form>
      </Card>
    </div>
  );
}
