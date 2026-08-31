"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { api } from "@/lib/client/format";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password })
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" ? (
        <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
      ) : null}
      <Input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      <Input
        type="password"
        placeholder={mode === "register" ? "Password (min. 8 characters)" : "Password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={mode === "register" ? 8 : 1}
        autoComplete={mode === "register" ? "new-password" : "current-password"}
      />
      {error ? <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p> : null}
      <Button type="submit" disabled={busy} className="w-full h-10">
        {busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
      <p className="text-center text-[13px] text-ink-500">
        {mode === "login" ? (
          <>
            No account? <Link href="/register" className="font-medium text-brand-700 hover:underline">Sign up</Link>
          </>
        ) : (
          <>
            Already registered? <Link href="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link>
          </>
        )}
      </p>
    </form>
  );
}
