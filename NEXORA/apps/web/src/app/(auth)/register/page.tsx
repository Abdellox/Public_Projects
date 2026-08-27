"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clientApi, ApiError } from "@/lib/api";
import { registerSchema } from "@nexora/validation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { ErrorNote } from "@/components/ui/card";

const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 10, label: "At least 10 characters" },
  { test: (v: string) => /[A-Za-z]/.test(v), label: "One letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" }
];

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/onboarding";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const dto = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? "")
    };
    const parsed = registerSchema.safeParse(dto);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again");
      return;
    }
    setPending(true);
    try {
      await clientApi("/auth/register", { method: "POST", body: JSON.stringify(parsed.data) });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed — please retry");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-ink-950">Create your account</h1>
      <p className="mt-1 text-sm text-ink-500">
        Then create an organization or accept an invitation.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <ErrorNote message={error ?? ""} />
        <Field label="Full name" htmlFor="name">
          <Input id="name" name="name" autoComplete="name" required placeholder="Ada Okafor" />
        </Field>
        <Field label="Work email" htmlFor="email">
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {PASSWORD_RULES.map((rule) => (
            <li
              key={rule.label}
              className={rule.test(password) ? "text-emerald-600" : "text-ink-400"}
            >
              {rule.test(password) ? "✓" : "•"} {rule.label}
            </li>
          ))}
        </ul>
        <Button type="submit" loading={pending} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
