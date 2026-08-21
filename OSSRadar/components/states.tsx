import { SearchIcon, WarningIcon } from "@/components/icons";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 p-8 text-center">
      <WarningIcon className="h-8 w-8 text-amber-400" />
      <h2 className="text-lg font-semibold text-white">Could not load data</h2>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="card mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 p-8 text-center">
      <SearchIcon className="h-8 w-8 text-muted" />
      <h2 className="text-lg font-semibold text-white">Nothing found</h2>
      <p className="text-sm text-muted">
        {message ?? "No results for this combination of filters. Try widening your search."}
      </p>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block h-10 w-10 animate-spin rounded-full border-2 border-edge border-t-accent ${className ?? ""}`}
      role="status"
      aria-label="Loading"
    />
  );
}
