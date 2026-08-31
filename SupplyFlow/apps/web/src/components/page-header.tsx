import { cn } from "@/lib/client/cn";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 px-6 pt-5 pb-3")}>
      <div>
        <h1 className="text-[17px] font-semibold tracking-tight text-ink-900">{title}</h1>
        {description ? <p className="mt-0.5 text-[13px] text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
