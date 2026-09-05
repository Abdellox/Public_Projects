"use client";

import type { GeneratedTestData } from "@/core/types";
import { cn } from "@/lib/cn";
import { CopyButton } from "./copy-button";

interface FieldRowProps {
  label: string;
  value: string | null;
  mono?: boolean;
  highlight?: boolean;
}

function FieldRow({ label, value, mono, highlight }: FieldRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-zinc-900/60 px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </div>
        <div
          className={cn(
            "truncate text-sm text-zinc-100",
            mono && "font-mono",
            highlight && "text-emerald-300",
          )}
        >
          {value ?? (
            <span className="text-zinc-600 italic">Not documented by provider</span>
          )}
        </div>
      </div>
      {value && <CopyButton text={value} label={`Copy ${label}`} />}
    </div>
  );
}

const outcomeColor: Record<string, string> = {
  success: "text-emerald-300",
  declined: "text-red-300",
  warning: "text-amber-300",
  info: "text-sky-300",
};

interface ResultCardProps {
  data: GeneratedTestData;
  outcome: "success" | "declined" | "warning" | "info";
}

export function ResultCard({ data, outcome }: ResultCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-100">
              {data.providerName}
            </span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              {data.scenario}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">{data.scenarioLabel}</div>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            outcomeColor[outcome],
          )}
        >
          {outcome}
        </span>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {/* Customer */}
        <div className="sm:col-span-2">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Customer
          </div>
          <div className="grid gap-2">
            <FieldRow label="Full name" value={data.customer.fullName} />
            <FieldRow label="Email" value={data.customer.email} mono />
            <FieldRow label="Phone" value={data.customer.phone} mono />
            <FieldRow
              label="Address"
              value={[
                data.customer.address.line1,
                data.customer.address.line2,
                data.customer.address.city,
                data.customer.address.state,
                data.customer.address.zip,
                data.customer.address.country,
              ]
                .filter(Boolean)
                .join(", ")}
            />
          </div>
        </div>

        {/* Card */}
        <div className="sm:col-span-2">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Card (sandbox values only)
          </div>
          {data.card ? (
            <div className="grid gap-2">
              <FieldRow label="Card number" value={data.card.number} mono highlight />
              <div className="grid grid-cols-2 gap-2">
                <FieldRow label="Expiry" value={data.card.expiry} mono />
                <FieldRow label="CVC" value={data.card.cvc} mono />
              </div>
              <FieldRow label="Brand" value={data.card.brand} />
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-zinc-700 bg-zinc-900/40 px-3 py-3 text-xs text-zinc-500">
              {data.providerName} does not document a card number for this exact
              scenario. Use the provider&apos;s general sandbox card numbers from the
              documentation.
            </div>
          )}
        </div>

        {/* Expected result */}
        <div className="sm:col-span-2">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Expected result
          </div>
          <p className="text-sm text-zinc-300">{data.expectedResult}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-zinc-800 bg-zinc-900/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          SANDBOX / TEST ONLY
        </p>
        <div className="flex items-center gap-2 text-xs">
          <a
            href={data.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
          >
            Provider docs
          </a>
          <a
            href={data.sandboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
          >
            Sandbox console
          </a>
        </div>
      </div>
    </div>
  );
}
