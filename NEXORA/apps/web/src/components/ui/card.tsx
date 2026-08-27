export function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-ink-200/70 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-ink-950">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="px-5 py-4">
      <p className="text-[13px] font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-ink-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-12 text-center">
      {icon ? <div className="text-ink-300">{icon}</div> : null}
      <p className="text-sm font-semibold text-ink-800">{title}</p>
      {description ? <p className="max-w-sm text-[13px] text-ink-500">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
      {message}
    </div>
  );
}
