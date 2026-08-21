"use client";

import { Fingerprint, RefreshCw } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Label, Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";

function emptySubscribe() {
  return () => {};
}

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [seed, setSeed] = useState(0);
  const [uppercase, setUppercase] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const uuids = useMemo(
    () =>
      mounted
        ? Array.from({ length: count }, () => crypto.randomUUID())
        : ([] as string[]),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed intentionally regenerates all values
    [mounted, count, seed]
  );

  const display = uppercase ? uuids.map((u) => u.toUpperCase()) : uuids;

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
              }
              className="w-24"
              aria-label="How many UUIDs"
            />
          </div>
          <label className="mb-2.5 flex cursor-pointer items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="size-3.5 accent-indigo-600"
            />
            Uppercase
          </label>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton value={display.join("\n")} label="Copy all" />
          <Button size="sm" onClick={() => setSeed((s) => s + 1)}>
            <RefreshCw className="size-3.5" /> Generate
          </Button>
        </div>
      </Panel>

      <Panel className="flex flex-col gap-2">
        <Label>RFC 4122 version 4 (random)</Label>
        <ul className="flex flex-col gap-1.5 font-mono text-sm">
          {display.map((id, i) => (
            <li
              key={i}
              className="group flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-500/40"
            >
              <span className="break-all text-zinc-700 select-all dark:text-zinc-200">{id}</span>
              <CopyButton value={id} label="" className="opacity-0 group-hover:opacity-100" />
            </li>
          ))}
        </ul>
      </Panel>

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <Fingerprint className="size-3.5" /> Generated with the Web Crypto API (CSPRNG) — safe to
        use in production.
      </p>
    </div>
  );
}
