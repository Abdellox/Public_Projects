import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/seo";
import { ArrowRightIcon } from "../components/icons";

export function NotFound() {
  usePageMeta("Page not found");

  return (
    <div className="mx-auto max-w-2xl px-4 py-28 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        This page doesn't exist
      </h1>
      <p className="mx-auto mt-4 max-w-md text-zinc-500 dark:text-zinc-400">
        Even well-run companies have broken links. Try starting from the
        beginning — the Start Here course covers everything from zero.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/start-here"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Start Learning <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
