import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchContent } from "../lib/search";
import { SearchIcon, XIcon } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => searchContent(query), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active].path);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/50 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Search CompanyOS"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <SearchIcon className="h-4 w-4 shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search lessons, departments, concepts, terms..."
            className="h-12 w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
            aria-label="Search query"
          />
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label="Close search"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {query && results.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">
              No results for “{query}”
            </p>
          )}
          {!query && (
            <div className="px-3 py-6 text-sm text-zinc-500">
              <p className="mb-3 font-medium text-zinc-600 dark:text-zinc-300">
                Try searching for…
              </p>
              <div className="flex flex-wrap gap-2">
                {["Revenue", "CAC", "Churn", "Finance", "Hierarchy", "OKR", "IPO"].map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-indigo-400"
                    >
                      {t}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={r.path + r.title}
              onClick={() => go(r.path)}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                i === active
                  ? "bg-indigo-50 dark:bg-indigo-500/10"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              }`}
            >
              <span className="mt-0.5 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {r.type}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {r.title}
                </span>
                <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {r.description}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-2 text-xs text-zinc-400 dark:border-zinc-800">
          <span>
            <kbd className="rounded border border-zinc-300 px-1 dark:border-zinc-700">↑↓</kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="rounded border border-zinc-300 px-1 dark:border-zinc-700">↵</kbd>{" "}
            open
          </span>
          <span>
            <kbd className="rounded border border-zinc-300 px-1 dark:border-zinc-700">esc</kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}
