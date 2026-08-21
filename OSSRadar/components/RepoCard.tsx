import Image from "next/image";
import type { Repository } from "@/types/github";
import { formatNumber, langColor, timeAgo } from "@/lib/utils";
import { ClockIcon, ForkIcon, IssueIcon, StarIcon } from "@/components/icons";

export default function RepoCard({ repo }: { repo: Repository }) {
  const topics = (repo.topics ?? []).slice(0, 4);

  return (
    <article className="card flex flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <Image
          src={repo.owner.avatar_url}
          alt={repo.owner.login}
          width={36}
          height={36}
          className="rounded-full border border-edge"
          unoptimized
        />
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate font-semibold text-white hover:text-accent"
        >
          {repo.full_name}
        </a>
      </div>

      {repo.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">
          {repo.description}
        </p>
      )}

      {topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {topics.map((topic) => (
            <span key={topic} className="pill border-edge bg-base font-normal text-accent2">
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-edge pt-3 text-xs text-muted">
        <span className="flex shrink-0 items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: langColor(repo.language) }}
          />
          {repo.language ?? "Unknown"}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-1" title="Stars">
            <StarIcon className="h-3.5 w-3.5" />
            {formatNumber(repo.stargazers_count)}
          </span>
          <span className="flex items-center gap-1" title="Forks">
            <ForkIcon className="h-3.5 w-3.5" />
            {formatNumber(repo.forks_count)}
          </span>
          <span className="flex items-center gap-1" title="Open issues">
            <IssueIcon className="h-3.5 w-3.5" />
            {formatNumber(repo.open_issues_count)}
          </span>
        </span>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted/80">
        <ClockIcon className="h-3 w-3" />
        Last push {timeAgo(repo.pushed_at)}
      </p>
    </article>
  );
}
