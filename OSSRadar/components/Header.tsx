"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GithubIcon } from "@/components/icons";

const NAV = [
  { href: "/", label: "Discover" },
  { href: "/trending", label: "Trending" },
];

export function RadarLogo() {
  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center">
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-accent">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        <path d="M12 12 L20 8 A 10 10 0 0 0 14 3.5 Z" fill="currentColor" opacity="0.35" />
      </svg>
      <span className="radar-ping absolute inset-0 rounded-full" aria-hidden />
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <RadarLogo />
            <span className="text-lg font-semibold tracking-tight text-white">
              OSS<span className="text-accent">Radar</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-panel font-medium text-white"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <a
          href="https://github.com/Abdellox/Public_Projects"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          <GithubIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Star on GitHub</span>
          <span className="sm:hidden">Star</span>
        </a>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 border-t border-edge px-4 py-2 sm:hidden">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-panel font-medium text-white"
                  : "text-muted hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
