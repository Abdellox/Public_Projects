import { Link } from "react-router-dom";
import { lessons } from "../content/lessons";
import { usePageMeta } from "../lib/seo";
import { Badge, levelTone } from "../components/ArticleLayout";
import { ClockIcon } from "../components/icons";
import { PageHeader } from "../components/PageHeader";

export function StartHere() {
  usePageMeta("Start Here", "A 10-lesson guided path through how companies work, from first principles to the full picture.");

  return (
    <>
      <PageHeader
        eyebrow="Guided learning path"
        title="Start Here"
        description="Ten short lessons that build on each other — from 'what is a company?' to understanding the whole system. Read them in order for best results."
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ol className="space-y-4">
          {lessons.map((l) => (
            <li key={l.slug}>
              <Link
                to={`/start-here/${l.slug}`}
                className="group flex gap-5 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-600/5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-500/40"
              >
                <span className="text-2xl font-bold text-zinc-200 transition-colors group-hover:text-indigo-400 sm:text-3xl dark:text-zinc-700">
                  {String(l.number).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <h2 className="font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {l.title}
                    </h2>
                    <Badge tone={levelTone[l.level]}>{l.level}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                      <ClockIcon className="h-3.5 w-3.5" /> {l.readingTime} min
                    </span>
                  </span>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    {l.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
                    Read lesson →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
