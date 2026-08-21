import { Suspense } from "react";
import FilterBar from "@/components/FilterBar";
import IssueCard from "@/components/IssueCard";
import Pagination from "@/components/Pagination";
import { EmptyState, ErrorState } from "@/components/states";
import { RateLimitError, searchIssues } from "@/lib/github";
import { formatNumber } from "@/lib/utils";
import type { Issue } from "@/types/github";

type SearchParams = Record<string, string | string[] | undefined>;

const PER_PAGE = 30;

function pick(sp: SearchParams, key: string, fallback: string): string {
  const value = sp[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const label = pick(sp, "label", "gfi");
  const language = pick(sp, "language", "");
  const sort = pick(sp, "sort", "created");
  const q = pick(sp, "q", "");
  let page = Number.parseInt(pick(sp, "page", "1"), 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  const labels =
    label === "hw"
      ? ["help wanted"]
      : label === "all"
        ? ["good first issue", "help wanted"]
        : ["good first issue"];

  // Params preserved by pagination links
  const filterParams: Record<string, string> = {};
  if (label !== "gfi") filterParams.label = label;
  if (language) filterParams.language = language;
  if (sort !== "created") filterParams.sort = sort;
  if (q) filterParams.q = q;

  let totalCount = 0;
  let issues: Issue[] = [];
  let error: string | null = null;

  try {
    const result = await searchIssues({ labels, language, q, sort, page, perPage: PER_PAGE });
    totalCount = result.total_count;
    issues = result.items.filter((issue) => !issue.pull_request);
  } catch (e) {
    error =
      e instanceof RateLimitError
        ? e.message
        : "Something went wrong while talking to the GitHub API. Please try again.";
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-edge">
        <div className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full border border-accent/10" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="pill mb-5 border-accent/30 bg-accent/10 text-accent">
            Live from the GitHub API
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Find your first{" "}
            <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
              open-source contribution
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-muted">
            OSS Radar scans GitHub for beginner-friendly issues and rising projects.
            No more endless searching — pick an issue, send a PR, become a contributor.
          </p>
        </div>
      </section>

      {/* Feed */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Suspense>
          <FilterBar label={label} language={language} sort={sort} q={q} />
        </Suspense>

        {error ? (
          <ErrorState message={error} />
        ) : issues.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="mb-4 mt-6 text-sm text-muted">
              <span className="font-medium text-slate-300">{formatNumber(totalCount)}</span>{" "}
              matching open issues
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
            <Pagination base="/" params={filterParams} page={page} hasNext={issues.length >= PER_PAGE} />
          </>
        )}
      </section>
    </>
  );
}
