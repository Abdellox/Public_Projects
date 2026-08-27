'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Field, FormError, Input, Logo } from '@nexora/ui';
import { apiPost, ApiClientError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiPost('/v1/auth/register', { name, email, password });
      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        const fieldErrors = Object.values(err.details as Record<string, string[]>)
          .flat()
          .join(' ');
        setError(fieldErrors || err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <Card className="w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold text-neutral-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Free and open source. Set up your organization in the next step.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormError message={error} />
          <Field label="Full name">
            <Input
              required
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field
            label="Password"
            hint="At least 10 characters with upper, lower case letters and a digit."
          >
            <Input
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
