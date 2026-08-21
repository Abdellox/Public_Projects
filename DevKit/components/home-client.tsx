"use client";

import { Lock, Puzzle, Search, Star, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GitHubIcon } from "@/components/header";
import { ToolCard } from "@/components/tool-card";
import { CONTRIBUTING_URL, GITHUB_URL, NEW_TOOL_ISSUE_URL } from "@/lib/site";
import { tools } from "@/lib/tools/registry";
import { CATEGORIES, type Category } from "@/lib/tools/types";

export function HomeClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const searchRef = useRef<HTMLInputElement>(null);
  const metas = tools;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return metas.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        CATEGORIES[t.category].toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q))
      );
    });
  }, [metas, query, category]);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-grid relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-indigo-500/10 to-transparent"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-20 text-center">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:text-indigo-400"
          >
            <Star className="size-3.5 text-amber-500" />
            Open source — star us on GitHub
          </a>
          <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Every developer tool you need.{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              One beautiful place.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-zinc-500 sm:text-lg dark:text-zinc-400">
            {metas.length} fast, free tools that run entirely in your browser. No sign-ups, no
            uploads, no limits.
          </p>

          <div className="relative mt-8 w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${metas.length} tools... (press /)`}
              aria-label="Search tools"
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-12 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
              /
            </kbd>
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All tools
          </FilterChip>
          {(Object.keys(CATEGORIES) as Category[]).map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORIES[c]}
            </FilterChip>
          ))}
          <span className="ml-auto hidden text-xs text-zinc-400 sm:block">
            {filtered.length} of {metas.length} tools
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-16 text-center dark:border-zinc-700">
            <Search className="size-8 text-zinc-300 dark:text-zinc-600" />
            <p className="font-medium text-zinc-600 dark:text-zinc-300">No tools found</p>
            <p className="text-sm text-zinc-400">
              Try a different search — or{" "}
              <a href={CONTRIBUTING_URL} className="text-indigo-500 hover:underline">
                build this tool yourself
              </a>{" "}
              and open a PR.
            </p>
          </div>
        )}
      </section>

      {/* Why DevKit */}
      <section className="border-t border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-3">
          {[
            {
              icon: Lock,
              title: "Privacy first",
              text: "Every tool runs 100% client-side. Your tokens, data and images never touch a server.",
            },
            {
              icon: Zap,
              title: "Blazingly fast",
              text: "Statically generated pages with zero backend. Tools open instantly and work offline.",
            },
            {
              icon: Puzzle,
              title: "Built by everyone",
              text: "Adding a tool is one component plus one registry entry. First PR friendly by design.",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
              <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 text-white">
                <f.icon className="size-4.5" />
              </span>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contribute CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-400/10 p-8 text-center sm:p-12">
          <GitHubIcon className="mx-auto size-8 text-indigo-500" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Have an idea for a tool?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            DevKit grows through community contributions. Ship your favorite utility in under an
            hour — no framework expertise required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={CONTRIBUTING_URL}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Read the contributing guide
            </a>
            <a
              href={NEW_TOOL_ISSUE_URL}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Request a tool
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-indigo-500 bg-indigo-600 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-indigo-400"
      }`}
    >
      {children}
    </button>
  );
}
