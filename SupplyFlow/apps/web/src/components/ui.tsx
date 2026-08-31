import { cn } from "@/lib/client/cn";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none sf-focus-ring",
        size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-9 px-3.5 text-[13px]",
        variant === "primary" && "bg-brand-600 text-white hover:bg-brand-700",
        variant === "secondary" && "border border-ink-200 bg-white text-ink-800 hover:bg-ink-100",
        variant === "ghost" && "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border border-ink-200 bg-white px-3 text-[13px] placeholder:text-ink-400 sf-focus-ring",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-md border border-ink-200 bg-white px-2.5 text-[13px] sf-focus-ring",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-[12px] font-medium text-ink-600 mb-1">
      {children}
    </label>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-ink-400">{hint}</p> : null}
    </div>
  );
}

const BADGE_STYLES: Record<string, string> = {
  healthy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  low: "bg-amber-50 text-amber-700 ring-amber-200",
  critical: "bg-orange-50 text-orange-700 ring-orange-200",
  out_of_stock: "bg-red-50 text-red-700 ring-red-200",
  draft: "bg-ink-100 text-ink-600 ring-ink-200",
  sent: "bg-blue-50 text-blue-700 ring-blue-200",
  confirmed: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  partially_received: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  received: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-ink-100 text-ink-500 ring-ink-200",
  pending: "bg-ink-100 text-ink-600 ring-ink-200",
  in_transit: "bg-blue-50 text-blue-700 ring-blue-200",
  arrived: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  processing: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  partially_shipped: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  shipped: "bg-blue-50 text-blue-700 ring-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  picking: "bg-violet-50 text-violet-700 ring-violet-200",
  packed: "bg-violet-50 text-violet-700 ring-violet-200",
  low_priority: "bg-ink-100 text-ink-600 ring-ink-200",
  medium: "bg-blue-50 text-blue-700 ring-blue-200",
  high: "bg-amber-50 text-amber-700 ring-amber-200",
  urgent: "bg-red-50 text-red-700 ring-red-200"
};

const LABELS: Record<string, string> = {
  partially_received: "Partially received",
  partially_shipped: "Partially shipped",
  in_transit: "In transit",
  out_of_stock: "Out of stock"
};

export function StatusBadge({ value }: { value: string }) {
  const style = BADGE_STYLES[value] ?? "bg-ink-100 text-ink-600 ring-ink-200";
  const label = LABELS[value] ?? value.replace(/_/g, " ");
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset whitespace-nowrap", style)}>
      {label}
    </span>
  );
}

export function RiskDot({ risk }: { risk: string }) {
  const color = { healthy: "bg-emerald-500", low: "bg-amber-400", critical: "bg-orange-500", out_of_stock: "bg-red-600" }[risk] ?? "bg-ink-300";
  return <span className={cn("inline-block h-2 w-2 rounded-full mr-1.5 shrink-0", color)} aria-hidden />;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center mb-3">
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-brand-600">
          <path d="M4 4l6-2 6 2v5c0 4.2-2.6 7.4-6 8.5C6.6 16.4 4 13.2 4 9V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="text-[14px] font-semibold text-ink-800">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-[13px] text-ink-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin h-4 w-4 text-ink-400", className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
