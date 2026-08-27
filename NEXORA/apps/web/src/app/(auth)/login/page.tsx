"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clientApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { ErrorNote } from "@/components/ui/card";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/home";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    try {
      await clientApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? "")
        })
      });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed — please retry");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-ink-950">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-500">Sign in to your digital organization.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <ErrorNote message={error ?? ""} />
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="ada@company.com"
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Button type="submit" loading={pending} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-500">
        Demo after seeding: <span className="font-medium text-ink-700">ada@nexora.dev</span> ·{" "}
        <span className="font-medium text-ink-700">Password123!</span>
      </div>

      <p className="mt-6 text-center text-[13px] text-ink-500">
        New here?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
