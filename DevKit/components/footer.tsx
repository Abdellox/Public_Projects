import Link from "next/link";
import { Heart, Wrench } from "lucide-react";
import { CONTRIBUTING_URL, GITHUB_URL, LICENSE_URL, SITE_NAME } from "@/lib/site";
import { tools } from "@/lib/tools/registry";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-10 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 text-white">
            <Wrench className="size-3.5" />
          </span>
          {SITE_NAME}
        </Link>
        <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          {tools.length} free tools that run entirely in your browser. No accounts, no tracking,
          no data leaving your device.
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1">
            Built with <Heart className="size-3 text-red-500" /> by the open-source community
          </span>
          <span>·</span>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-300">
            GitHub
          </a>
          <span>·</span>
          <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-300">
            MIT License
          </a>
          <span>·</span>
          <a href={CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-300">
            Contribute a tool
          </a>
        </p>
      </div>
    </footer>
  );
}
