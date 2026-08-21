import Image from "next/image";
import type { Issue } from "@/types/github";
import { repoFullName, timeAgo } from "@/lib/utils";
import { CommentIcon } from "@/components/icons";

function labelStyle(color?: string): React.CSSProperties | undefined {
  if (!color || !/^[0-9a-fA-F]{6}$/.test(color)) return undefined;
  return {
    backgroundColor: `#${color}26`,
    color: `#${color}`,
  };
}

const HIGHLIGHTED = new Set(["good first issue", "help wanted", "beginner", "beginner friendly", "easy"]);

export default function IssueCard({ issue }: { issue: Issue }) {
  const fullName = repoFullName(issue.repository_url);
  const labels = issue.labels.filter((l) => l.name).slice(0, 4);

  return (
    <article className="card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-semibold leading-snug text-white hover:text-accent"
        >
          {issue.title}
        </a>
        <span className="pill shrink-0 border-edge bg-base text-muted">
          #{issue.number}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {labels.map((label) => (
          <span
            key={label.id}
            className={`pill border ${
              HIGHLIGHTED.has(label.name.toLowerCase())
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-edge bg-base text-slate-300"
            }`}
            style={HIGHLIGHTED.has(label.name.toLowerCase()) ? undefined : labelStyle(label.color)}
          >
            {label.name}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-edge pt-3 text-xs text-muted">
        <span className="flex min-w-0 items-center gap-2">
          {issue.user && (
            <Image
              src={issue.user.avatar_url}
              alt={issue.user.login}
              width={20}
              height={20}
              className="rounded-full"
              unoptimized
            />
          )}
          <a
            href={`https://github.com/${fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-mono text-[11px] text-slate-300 hover:text-accent"
          >
            {fullName}
          </a>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-1">
            <CommentIcon className="h-3.5 w-3.5" />
            {issue.comments}
          </span>
          <span>{timeAgo(issue.created_at)}</span>
        </span>
      </div>
    </article>
  );
}
