import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import LanguageSelect from "@/components/LanguageSelect";
import RepoCard from "@/components/RepoCard";
import Pagination from "@/components/Pagination";
import { EmptyState, ErrorState } from "@/components/states";
import { RateLimitError, searchRepositories } from "@/lib/github";
import { daysAgoISO, formatNumber } from "@/lib/utils";
import type { Repository } from "@/types/github";

export const metadata: Metadata = {
  title: "Trending repositories",
};

type SearchParams = Record<string, string | string[] | undefined>;

const PER_PAGE = 24;

const TABS = [
  { id: "new", label: "Rising this month" },
  { id: "top", label: "All-time greats" },
];

function pick(sp: SearchParams, key: string, fallback: string): string {
  const value = sp[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const tab = pick(sp, "tab", "new");
  const language = pick(sp, "language", "");
  let page = Number.parseInt(pick(sp, "page", "1"), 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  // "Rising": created in the last 30 days and already collecting stars.
  // "Greats": the all-time hall of fame.
  const query =
    tab === "top"
      ? "stars:>20000"
      : `created:>${daysAgoISO(30)} stars:>30`;

  const filterParams: Record<string, string> = {};
  if (tab !== "new") filterParams.tab = tab;
  if (language) filterParams.language = language;

  let totalCount = 0;
  let repos: Repository[] = [];
  let error: string | null = null;

  try {
    const result = await searchRepositories({
      query,
      language,
      sort: "stars",
      page,
      perPage: PER_PAGE,
    });
    totalCount = result.total_count;
    repos = result.items;
  } catch (e) {
    error =
      e instanceof RateLimitError
        ? e.message
        : "Something went wrong while talking to the GitHub API. Please try again.";
  }

  function tabHref(tabId: string): string {
    const qs = new URLSearchParams();
    if (tabId !== "new") qs.set("tab", tabId);
    if (language) qs.set("language", language);
    const queryString = qs.toString();
    return queryString ? `/trending?${queryString}` : "/trending";
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Trending repositories
          </h1>
          <p className="mt-2 text-sm text-muted">
            Projects gaining momentum right now — great places to contribute early.
          </p>
        </div>

        {/* Tabs + language filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Suspense>
            <LanguageSelect value={language} />
          </Suspense>
          <div className="flex w-fit rounded-lg border border-edge bg-panel p-1" role="group" aria-label="Trending mode">
            {TABS.map((t) => (
              <Link
                key={t.id}
                href={tabHref(t.id)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  tab === t.id
                    ? "bg-accent/15 font-medium text-accent"
                    : "text-muted hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : repos.length === 0 ? (
        <EmptyState message="No repositories matched. Try a different language or time range." />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            <span className="font-medium text-slate-300">{formatNumber(totalCount)}</span>{" "}
            matching repositories
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
          <Pagination base="/trending" params={filterParams} page={page} hasNext={repos.length >= PER_PAGE} />
        </>
      )}
    </section>
  );
}
