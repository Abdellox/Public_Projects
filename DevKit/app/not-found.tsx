import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <Compass className="size-7 text-zinc-400" />
      </span>
      <h1 className="text-3xl font-bold tracking-tight">404 — tool not found</h1>
      <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        That tool doesn&apos;t exist yet. Maybe you could be the one to build it?
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        Browse all tools
      </Link>
    </main>
  );
}
