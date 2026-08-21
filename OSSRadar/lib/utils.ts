const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Dart: "#00b4ab",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Zig: "#ec915c",
  Lua: "#000080",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Scala: "#c22d40",
};

export function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

const TIME_UNITS: Array<[number, string]> = [
  [31_536_000, "year"],
  [2_592_000, "month"],
  [604_800, "week"],
  [86_400, "day"],
  [3_600, "hour"],
  [60, "minute"],
];

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  for (const [unitSeconds, unitName] of TIME_UNITS) {
    const value = Math.floor(seconds / unitSeconds);
    if (value >= 1) {
      return `${value} ${unitName}${value > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

export function langColor(language: string | null | undefined): string {
  if (!language) return "#8b98a9";
  return LANGUAGE_COLORS[language] ?? "#8b98a9";
}

/** Extracts "owner/repo" from an issue's repository_url API link. */
export function repoFullName(repositoryUrl: string): string {
  const parts = repositoryUrl.split("/");
  return parts.slice(-2).join("/");
}

/** ISO date (YYYY-MM-DD) for N days ago — used by GitHub search qualifiers like created:>... */
export function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}
