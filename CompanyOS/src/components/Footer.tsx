import { Link } from "react-router-dom";
import { Logo } from "./Header";

const REPO = "https://github.com/Abdellox/Public_Projects";
const PROJECT = `${REPO}/tree/main/CompanyOS`;

const cols: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Learn",
    links: [
      { label: "Start Here", to: "/start-here" },
      { label: "How Companies Work", to: "/how-companies-work" },
      { label: "Roles & Hierarchy", to: "/roles" },
      { label: "Company Lifecycle", to: "/lifecycle" },
    ],
  },
  {
    title: "Reference",
    links: [
      { label: "Departments", to: "/departments" },
      { label: "Business Fundamentals", to: "/fundamentals" },
      { label: "Scenarios", to: "/scenarios" },
      { label: "Glossary", to: "/glossary" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "About", to: "/about" },
      { label: "GitHub", to: PROJECT },
      { label: "Contributing", to: `${PROJECT}/blob/main/CONTRIBUTING.md` },
      { label: "MIT License", to: `${PROJECT}/blob/main/LICENSE` },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              An open-source handbook that explains how companies work — in plain
              language, for everyone.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to.startsWith("http") ? (
                      <a
                        href={l.to}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.to}
                        className="text-sm text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-zinc-200 pt-8 sm:flex-row sm:items-center dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} CompanyOS · Open source under MIT License
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            v0.1 — Static Handbook
          </p>
        </div>
      </div>
    </footer>
  );
}
