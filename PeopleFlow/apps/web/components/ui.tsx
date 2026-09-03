"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn, initials as toInitials } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm",
        variant === "primary" && "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
        variant === "secondary" && "border border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50",
        variant === "ghost" && "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        variant === "danger" && "bg-red-600 text-white shadow-sm hover:bg-red-700",
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {children}
    </button>
  );
});

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input-base", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("input-base", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("input-base min-h-[80px]", className)} {...props} />;
}

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="block text-xs font-medium text-zinc-600">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-zinc-400">{hint}</span>}
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border border-zinc-200 bg-white shadow-card", className)}>{children}</div>;
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
      <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
      {action}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  gray: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function Badge({ tone = "gray", children, className }: { tone?: keyof typeof badgeTones | string; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        badgeTones[tone] ?? badgeTones.gray,
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusTone: Record<string, string> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
  CANCELLED: "gray",
  TODO: "blue",
  IN_PROGRESS: "violet",
  COMPLETED: "green",
  CANCELLED_TASK: "gray",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? "gray"}>{status.replace(/_/g, " ")}</Badge>;
}

export function Avatar({ name, url, size = "md" }: { name?: string | null; url?: string | null; size?: "sm" | "md" | "lg" }) {
  const dimension = size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-14 w-14 text-lg" : "h-9 w-9 text-xs";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={cn(dimension, "rounded-full object-cover")} />;
  }
  return (
    <span className={cn("inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700", dimension)}>
      {name ? toInitials(name) : "?"}
    </span>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-400">{sub}</p>}
    </Card>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-brand-600", className)} aria-label="Loading" />;
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {icon && <div className="text-zinc-300">{icon}</div>}
      <p className="text-sm font-medium text-zinc-700">{title}</p>
      {description && <p className="max-w-sm text-xs text-zinc-400">{description}</p>}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-400">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-5 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">{children}</tbody>
      </table>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-950/40 p-4 pt-16 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cn("w-full rounded-xl bg-white shadow-xl", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">
      {message}
    </div>
  );
}
