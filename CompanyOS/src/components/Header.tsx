import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../lib/theme";
import {
  GitHubIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  XIcon,
} from "./icons";

const GITHUB_URL = "https://github.com/Abdellox/Public_Projects";

const nav = [
  { label: "Start Here", to: "/start-here" },
  { label: "Departments", to: "/departments" },
  { label: "Fundamentals", to: "/fundamentals" },
  { label: "Roles", to: "/roles" },
  { label: "Lifecycle", to: "/lifecycle" },
  { label: "Scenarios", to: "/scenarios" },
  { label: "Glossary", to: "/glossary" },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <rect x="4" y="12" width="3.2" height="8" rx="0.8" />
          <rect x="10.4" y="6" width="3.2" height="14" rx="0.8" />
          <rect x="16.8" y="15" width="3.2" height="5" rx="0.8" />
        </svg>
      </span>
      {!compact && (
        <span className="text-[17px]">
          Company<span className="text-indigo-600 dark:text-indigo-400">OS</span>
        </span>
      )}
    </Link>
  );
}

export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-2.5 py-1.5 text-sm transition-colors ${
      isActive
        ? "font-medium text-zinc-900 dark:text-zinc-50"
        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-lg dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkCls}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onOpenSearch}
            className="hidden items-center gap-2 rounded-lg border border-zinc-200 py-1.5 pl-3 pr-2 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 sm:flex dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
            aria-label="Search (Ctrl+K)"
          >
            <SearchIcon className="h-4 w-4" />
            <span>Search</span>
            <kbd className="rounded border border-zinc-200 px-1.5 font-sans text-[11px] dark:border-zinc-700">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={onOpenSearch}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 sm:hidden dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Search"
          >
            <SearchIcon />
          </button>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 sm:block dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="GitHub repository"
          >
            <GitHubIcon />
          </a>

          <button
            onClick={toggle}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 xl:hidden dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-zinc-200 bg-white px-4 pb-4 pt-2 xl:hidden dark:border-zinc-800 dark:bg-zinc-950"
          aria-label="Mobile"
        >
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) =>
              `block rounded-lg px-3 py-2.5 text-sm ${
                isActive
                  ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`
            }>
              {n.label}
            </NavLink>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <GitHubIcon className="h-4 w-4" /> GitHub
          </a>
        </nav>
      )}
    </header>
  );
}
