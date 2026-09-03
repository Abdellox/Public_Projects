"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { Button, ErrorBanner, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/auth/login", { method: "POST", body: { email, password } });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
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
            <h1 className="text-lg font-semibold">Welcome back</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Sign in to your workspace.</p>
          </div>
          <ErrorBanner message={error} />
          <Field label="Work email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoFocus />
          </Field>
          <Field label="Password">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
          <p className="text-center text-xs text-zinc-500">
            New here?{" "}
            <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
              Create a workspace
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
