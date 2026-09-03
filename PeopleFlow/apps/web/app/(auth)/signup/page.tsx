"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { Button, ErrorBanner, Field, Input } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/auth/signup", {
        method: "POST",
        body: { organizationName, name, email, password },
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold text-zinc-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">PF</span>
          PeopleFlow
        </Link>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card">
          <div>
            <h1 className="text-lg font-semibold">Create your workspace</h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              You&apos;ll be the owner. Invite your team in seconds.
            </p>
          </div>
          <ErrorBanner message={error} />
          <Field label="Organization name" hint="You can change this later in settings.">
            <Input required value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Acme Inc." autoFocus />
          </Field>
          <Field label="Your full name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
          </Field>
          <Field label="Work email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </Field>
          <Field label="Password" hint="At least 10 characters with letters and numbers.">
            <Input type="password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Create workspace
          </Button>
          <p className="text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
