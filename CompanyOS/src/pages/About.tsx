import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/seo";
import { PageHeader } from "../components/PageHeader";
import { GitHubIcon } from "../components/icons";

const GITHUB_URL = "https://github.com/Abdellox/Public_Projects";

export function About() {
  usePageMeta("About", "CompanyOS is an open-source project designed to make business knowledge accessible to everyone.");

  return (
    <>
      <PageHeader
        title="About CompanyOS"
        description="CompanyOS is an open-source project designed to make business knowledge accessible to everyone."
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Why this exists
            </h2>
            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
              Most business education is either too academic (an MBA costs more
              than a car) or too shallow (a 60-second video that leaves you
              unable to apply anything). The knowledge of how companies actually
              work — how departments connect, what the numbers mean, why
              decisions happen — stays locked inside organizations and expensive
              programs.
            </p>
            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
              CompanyOS opens it. Every explanation follows one rule: assume the
              reader knows nothing, define simply, explain why it matters, then
              show a real example.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Who it's for
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["New employees", "Understand your first company faster than your onboarding explains it"],
                ["Students & interns", "Walk into any workplace already speaking the language"],
                ["Managers", "Fill gaps outside your specialty — finance, product, legal"],
                ["Founders", "See the full machine you're building, beyond your own domain"],
              ].map(([who, why]) => (
                <div key={who} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{who}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{why}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <GitHubIcon />
              </span>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Open source</h2>
                <p className="mt-1.5 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Everything — content, code, design — lives in the open under
                  the MIT License. Fork it, translate it, adapt it for your
                  team's onboarding, or use it as a template for your own
                  handbook.
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-colors hover:bg-indigo-500"
                  >
                    <GitHubIcon className="h-4 w-4" /> Star on GitHub
                  </a>
                  <Link
                    to="/glossary"
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    Explore content first
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Contributing
            </h2>
            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
              Content improvements matter more than code. If an explanation
              confused you, it will confuse others — fix it. Ways to help:
            </p>
            <ul className="mt-3 space-y-2 pl-1">
              {[
                "Add glossary terms you had to Google yourself",
                "Improve clarity of any lesson, guide, or department page",
                "Suggest new scenarios from your own work experience",
                "Translate content into other languages",
                "Report bugs, accessibility issues, or broken links",
              ].map((c) => (
                <li key={c} className="flex gap-2.5 leading-7 text-zinc-600 dark:text-zinc-400">
                  <span aria-hidden="true" className="mt-[15px] h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
              Standard flow: fork → branch → commit → pull request. Keep
              explanations simple; write like you're explaining to a smart
              friend who has never worked in an office.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Where this is going
            </h2>
            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
              This static handbook is version one. The roadmap adds global
              search and learning progress, personalized paths with accounts,
              company/team workspaces for internal onboarding, an AI tutor for
              asking questions in plain language, and community translations.
            </p>
            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
              The vision: when anyone starts any job at any company, they can
              understand how the whole thing works within a week — not by luck,
              but because the knowledge is finally written down somewhere free.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
