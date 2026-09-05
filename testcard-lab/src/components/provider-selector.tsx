"use client";

import type { Provider } from "@/core/types";
import { cn } from "@/lib/cn";

interface ProviderSelectorProps {
  providers: Provider[];
  selected: string;
  onSelect: (id: string) => void;
}

export function ProviderSelector({
  providers,
  selected,
  onSelect,
}: ProviderSelectorProps) {
  return (
    <section aria-label="Payment provider">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
        Payment provider
      </h2>
      <div
        role="radiogroup"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        aria-label="Payment provider"
      >
        {providers.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(p.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-zinc-600 bg-zinc-800 text-zinc-50"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200",
              )}
              style={
                active
                  ? { borderColor: p.brandColor, boxShadow: `0 0 0 1px ${p.brandColor}55` }
                  : undefined
              }
            >
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: p.brandColor }}
              />
              <span className="text-sm font-medium truncate">{p.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
