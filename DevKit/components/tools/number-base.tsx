"use client";

import { Calculator } from "lucide-react";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const BASES = [
  { base: 2, label: "Binary", pattern: /^[01]+$/ },
  { base: 8, label: "Octal", pattern: /^[0-7]+$/ },
  { base: 10, label: "Decimal", pattern: /^\d+$/ },
  { base: 16, label: "Hexadecimal", pattern: /^[0-9a-f]+$/i },
] as const;

export default function NumberBase() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState("10");

  const source = BASES.find((b) => b.base === Number(fromBase)) ?? BASES[2];

  const parsed = useMemo(() => {
    const clean = input.trim().replace(/^0[xbo]/i, "");
    if (!clean) return { value: null as number | null, error: null as string | null };
    if (!source.pattern.test(clean)) {
      return { value: null, error: `Not a valid ${source.label.toLowerCase()} number.` };
    }
    const n = parseInt(clean, source.base);
    if (!Number.isSafeInteger(n)) {
      return { value: null, error: "Number exceeds the safe integer range." };
    }
    return { value: n, error: null as string | null };
  }, [input, source]);

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 grow">
          <Label>Number</Label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="42"
            className="mt-1.5 font-mono text-lg"
            aria-label="Number"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Input base</Label>
          <Select
            value={fromBase}
            onChange={(e) => setFromBase(e.target.value)}
            aria-label="Input base"
          >
            {BASES.map((b) => (
              <option key={b.base} value={b.base}>
                Base {b.base} — {b.label}
              </option>
            ))}
          </Select>
        </div>
      </Panel>

      {parsed.error && <ErrorText>{parsed.error}</ErrorText>}

      {parsed.value !== null && (
        <div className="grid gap-4 sm:grid-cols-2">
          {BASES.map((b) => {
            const converted =
              b.base === source.base
                ? input.trim()
                : parsed.value!.toString(b.base).toUpperCase();
            return (
              <Panel key={b.base} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Label>
                    Base {b.base} · {b.label}
                  </Label>
                  <p className="mt-1 truncate font-mono text-sm text-zinc-800 dark:text-zinc-100">
                    {converted}
                  </p>
                </div>
                <CopyButton value={converted} label="" />
              </Panel>
            );
          })}
        </div>
      )}

      {!input.trim() && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-10 text-sm text-zinc-400 dark:border-zinc-700">
          <Calculator className="size-8 opacity-50" />
          Enter a number to convert between binary, octal, decimal and hex
        </div>
      )}
    </div>
  );
}
