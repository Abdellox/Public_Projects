"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, type ToolMeta } from "@/lib/tools/types";

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-500/40"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/15 to-cyan-400/15 text-indigo-600 transition-colors group-hover:from-indigo-500 group-hover:to-cyan-400 group-hover:text-white dark:text-indigo-400">
          <Icon className="size-5" />
        </span>
        <ArrowRight className="size-4 text-zinc-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-zinc-600" />
      </div>
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{tool.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {tool.description}
        </p>
      </div>
      <span className="mt-auto w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        {CATEGORIES[tool.category]}
      </span>
    </Link>
  );
}
