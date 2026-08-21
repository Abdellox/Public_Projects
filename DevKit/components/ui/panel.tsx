import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-red-300/50 bg-red-50 px-3 py-2 font-mono text-xs leading-relaxed break-all text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
      {children}
    </p>
  );
}
