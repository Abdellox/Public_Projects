"use client";

import type { Scenario } from "@/core/types";
import { cn } from "@/lib/cn";

const outcomeStyles: Record<Scenario["outcome"], string> = {
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  declined: "border-red-500/40 bg-red-500/10 text-red-300",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

const outcomeDot: Record<Scenario["outcome"], string> = {
  success: "bg-emerald-400",
  declined: "bg-red-400",
  warning: "bg-amber-400",
  info: "bg-sky-400",
};

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selected: string;
  onSelect: (id: string) => void;
}

export function ScenarioSelector({
  scenarios,
  selected,
  onSelect,
}: ScenarioSelectorProps) {
  return (
    <section aria-label="Test scenario">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
        Test scenario
      </h2>
      <div
        role="radiogroup"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        aria-label="Test scenario"
      >
        {scenarios.map((s) => {
          const active = selected === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(s.id)}
              className={cn(
                "text-left rounded-lg border px-3 py-2.5 transition-colors",
                active
                  ? outcomeStyles[s.outcome]
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "inline-block h-2 w-2 rounded-full shrink-0",
                    active ? outcomeDot[s.outcome] : "bg-zinc-600",
                  )}
                />
                <span className="text-sm font-medium truncate">{s.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
