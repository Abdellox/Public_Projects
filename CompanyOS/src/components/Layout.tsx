import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SearchModal } from "./SearchModal";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <Link
            to="/"
            className="text-zinc-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Home
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            {c.to && i < items.length - 1 ? (
              <NavLink
                to={c.to}
                className="text-zinc-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {c.label}
              </NavLink>
            ) : (
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-50 h-0.5 bg-indigo-600 transition-[width] duration-100"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-label="Reading progress"
    />
  );
}
