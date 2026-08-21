"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { Label, Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

const ALGORITHMS = [
  { id: "SHA-1", label: "SHA-1" },
  { id: "SHA-256", label: "SHA-256" },
  { id: "SHA-384", label: "SHA-384" },
  { id: "SHA-512", label: "SHA-512" },
] as const;

type AlgorithmId = (typeof ALGORITHMS)[number]["id"];

async function digest(algorithm: AlgorithmId, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [computed, setComputed] = useState<{
    input: string;
    hashes: Partial<Record<AlgorithmId, string>>;
  }>({ input: "", hashes: {} });

  useEffect(() => {
    if (!input) return;
    let cancelled = false;
    Promise.all(
      ALGORITHMS.map(async (a) => [a.id, await digest(a.id, input)] as const)
    ).then((entries) => {
      if (!cancelled) setComputed({ input, hashes: Object.fromEntries(entries) });
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  const hashes = computed.input === input ? computed.hashes : {};

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-col gap-3">
        <Label>Text to hash</Label>
        <Textarea
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste anything — hashes update as you type"
          aria-label="Input text"
        />
      </Panel>

      {ALGORITHMS.map((a) => (
        <Panel key={a.id} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>{a.label}</Label>
            <CopyButton value={hashes[a.id] ?? ""} />
          </div>
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs break-all text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {hashes[a.id] ?? "—"}
          </p>
        </Panel>
      ))}

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <ShieldCheck className="size-3.5" /> Computed locally with the Web Crypto API. Note that
        plain hashing is not a substitute for password-specific algorithms like bcrypt or
        argon2.
      </p>
    </div>
  );
}
