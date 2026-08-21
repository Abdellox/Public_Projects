import type { Issue, Repository, SearchResult } from "@/types/github";

const GITHUB_API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN ?? "";
const DEFAULT_REVALIDATE_SECONDS = 600; // cache API responses for 10 minutes

export class RateLimitError extends Error {
  constructor() {
    super(
      "GitHub API rate limit reached. Add a GITHUB_TOKEN in .env.local for 5,000 requests/hour, or try again in a minute.",
    );
    this.name = "RateLimitError";
  }
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }
  return headers;
}

async function ghSearch<T>(
  endpoint: string,
  params: Record<string, string>,
  revalidateSeconds: number = DEFAULT_REVALIDATE_SECONDS,
): Promise<SearchResult<T>> {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${GITHUB_API}${endpoint}?${qs}`, {
    headers: ghHeaders(),
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    if (res.status === 403 || res.status === 429) {
      throw new RateLimitError();
    }
    throw new Error(`GitHub API error (HTTP ${res.status})`);
  }

  return (await res.json()) as SearchResult<T>;
}

export interface IssueSearchOptions {
  labels: string[];
  language?: string;
  q?: string;
  sort: string;
  page: number;
  perPage: number;
}

/**
 * Searches open GitHub issues carrying beginner-friendly labels.
 * Multiple labels are OR-ed together using the comma syntax.
 */
export function searchIssues(options: IssueSearchOptions): Promise<SearchResult<Issue>> {
  const parts = ["state:open", "is:issue"];
  if (options.labels.length > 0) {
    parts.push(`label:${options.labels.map((l) => `"${l}"`).join(",")}`);
  }
  if (options.language) {
    parts.push(`language:${options.language}`);
  }
  if (options.q) {
    parts.push(options.q);
  }

  return ghSearch<Issue>("/search/issues", {
    q: parts.join(" "),
    sort: options.sort,
    order: "desc",
    per_page: String(options.perPage),
    page: String(options.page),
  });
}

export interface RepoSearchOptions {
  query: string;
  language?: string;
  sort: string;
  page: number;
  perPage: number;
}

/** Searches repositories with an arbitrary pre-built query. */
export function searchRepositories(options: RepoSearchOptions): Promise<SearchResult<Repository>> {
  const parts = [options.query];
  if (options.language) {
    parts.push(`language:${options.language}`);
  }

  return ghSearch<Repository>("/search/repositories", {
    q: parts.join(" "),
    sort: options.sort,
    order: "desc",
    per_page: String(options.perPage),
    page: String(options.page),
  });
}
