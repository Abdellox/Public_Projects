import { Link } from "react-router-dom";
import type { Article, Section } from "../content/types";
import { Breadcrumbs, ReadingProgress, type Crumb } from "./Layout";
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from "./icons";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "indigo" | "green" | "amber";
}) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export const levelTone = {
  Beginner: "green",
  Intermediate: "indigo",
  Advanced: "amber",
} as const;

export function SectionBody({ section }: { section: Section }) {
  return (
    <section id={section.id} aria-label={section.heading} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
        {section.heading}
      </h2>
      <div className="mt-3 space-y-3">
        {section.paragraphs?.map((p, i) => (
          <p key={i} className="leading-7 text-zinc-600 dark:text-zinc-400">
            {p}
          </p>
        ))}
        {section.bullets && (
          <ul className="space-y-2 pl-1">
            {section.bullets.map((b, i) => (
              <li key={i} className="flex gap-2.5 leading-7 text-zinc-600 dark:text-zinc-400">
                <span aria-hidden="true" className="mt-[15px] h-1 w-1 shrink-0 rounded-full bg-indigo-500" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface Props {
  article: Article;
  crumbs: Crumb[];
  basePath: string;
  siblings?: Article[];
  related?: { title: string; to: string; description: string }[];
  meta?: React.ReactNode;
  children?: React.ReactNode;
}

export function ArticleLayout({
  article,
  crumbs,
  basePath,
  siblings = [],
  related = [],
  meta,
  children,
}: Props) {
  const idx = siblings.findIndex((s) => s.slug === article.slug);
  const prev = idx > 0 ? siblings[idx - 1] : undefined;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={crumbs} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] xl:gap-16">
          <article className="min-w-0 max-w-3xl">
            <header className={children ? "mb-8" : "mb-12"}>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                {article.title}
              </h1>
              <p className="mt-4 text-lg leading-7 text-zinc-500 dark:text-zinc-400">
                {article.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm text-zinc-500">
                <Badge tone={levelTone[article.level]}>{article.level}</Badge>
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <ClockIcon className="h-3.5 w-3.5" /> {article.readingTime} min read
                </span>
                {meta}
              </div>
            </header>

            {!children && (
              <div className="space-y-10 border-t border-zinc-200 pt-10 dark:border-zinc-800">
                {article.sections.map((s) => (
                  <SectionBody key={s.id} section={s} />
                ))}
              </div>
            )}
            {children}

            {(prev || next) && (
              <nav
                className="mt-16 grid gap-4 border-t border-zinc-200 pt-8 sm:grid-cols-2 dark:border-zinc-800"
                aria-label="Previous and next"
              >
                {prev ? (
                  <Link
                    to={`${basePath}/${prev.slug}`}
                    className="group rounded-xl border border-zinc-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-zinc-800 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/5"
                  >
                    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <ArrowLeftIcon className="h-3.5 w-3.5" /> Previous
                    </span>
                    <span className="mt-1 block font-medium text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <span aria-hidden="true" />
                )}
                {next && (
                  <Link
                    to={`${basePath}/${next.slug}`}
                    className="group rounded-xl border border-zinc-200 p-4 text-right transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 sm:col-start-2 dark:border-zinc-800 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/5"
                  >
                    <span className="flex items-center justify-end gap-1.5 text-xs text-zinc-400">
                      Next <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="mt-1 block font-medium text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {next.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  On this page
                </p>
                <nav aria-label="Table of contents" className="border-l border-zinc-200 pl-4 dark:border-zinc-800">
                  {article.sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollToId(s.id)}
                      className="block w-full py-1 text-left text-sm leading-5 text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                    >
                      {s.heading}
                    </button>
                  ))}
                </nav>
              </div>

              {related.length > 0 && (
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Related
                  </p>
                  <ul className="space-y-3">
                    {related.map((r) => (
                      <li key={r.to}>
                        <Link
                          to={r.to}
                          className="text-sm font-medium leading-5 text-zinc-700 transition-colors hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
                        >
                          {r.title}
                        </Link>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-zinc-400">
                          {r.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
