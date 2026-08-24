import { roles, hierarchyNotes } from "../content/roles";
import { usePageMeta } from "../lib/seo";
import { PageHeader } from "../components/PageHeader";

export function RolesPage() {
  usePageMeta("Roles & Hierarchy", "Company hierarchy explained from Intern to CEO — what each level does, its scope, focus, and reporting lines.");

  return (
    <>
      <PageHeader
        eyebrow="People & structure"
        title="Roles & Hierarchy"
        description="The company ladder from entry level to the executive suite — what each level actually does, and how they connect."
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Visual ladder */}
        <div className="mb-14 flex flex-col items-center">
          {roles.map((r, i) => {
            const isExec = i >= 7;
            const isMgmt = i >= 5 && i < 7;
            return (
              <div key={r.id} className="flex w-full flex-col items-center">
                <a
                  href={`#${r.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(r.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`w-full max-w-md rounded-xl border px-5 py-3.5 text-center shadow-sm transition-all hover:-translate-y-0.5 ${
                    isExec
                      ? "border-indigo-300 bg-indigo-50 font-semibold text-indigo-800 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200"
                      : isMgmt
                        ? "border-violet-200 bg-violet-50/70 font-medium text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200"
                        : "border-zinc-200 bg-white font-medium text-zinc-700 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  {r.title}
                </a>
                {i < roles.length - 1 && (
                  <svg viewBox="0 0 24 24" className="my-1 h-4 w-4 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 5v14m6-6-6 6-6-6" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mb-12 flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900" /> Individual contributors
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-violet-300 bg-violet-100 dark:border-violet-500/40 dark:bg-violet-500/20" /> Management
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-indigo-400 bg-indigo-100 dark:border-indigo-500/60 dark:bg-indigo-500/25" /> Executive
          </span>
        </div>

        {/* Level details */}
        <div className="space-y-6">
          {roles.map((r, i) => (
            <section
              key={r.id}
              id={r.id}
              className="scroll-mt-24 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {String(i + 1).padStart(2, "0")} · {r.title}
                </h2>
                <span className="text-xs text-zinc-400">{r.typicalExperience}</span>
              </div>
              {r.alsoKnownAs.length > 0 && (
                <p className="mt-1 text-xs text-zinc-400">
                  Also known as: {r.alsoKnownAs.join(", ")}
                </p>
              )}

              <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_220px]">
                <ul className="space-y-2 pl-1">
                  {r.focus.map((f, j) => (
                    <li key={j} className="flex gap-2.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      <span aria-hidden="true" className="mt-[13px] h-1 w-1 shrink-0 rounded-full bg-indigo-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <dl className="space-y-3 rounded-lg bg-zinc-50/80 p-4 text-sm dark:bg-zinc-900/60">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Scope</dt>
                    <dd className="mt-0.5 leading-6 text-zinc-600 dark:text-zinc-400">{r.scope}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Reports to</dt>
                    <dd className="mt-0.5 leading-6 text-zinc-600 dark:text-zinc-400">{r.reportsTo}</dd>
                  </div>
                </dl>
              </div>
            </section>
          ))}
        </div>

        {/* Caveats */}
        <aside className="mt-12 rounded-xl border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-500/30 dark:bg-amber-500/5">
          <h2 className="font-semibold text-amber-800 dark:text-amber-200">
            Important: titles vary everywhere
          </h2>
          <ul className="mt-3 space-y-2 pl-1">
            {hierarchyNotes.map((n, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-6 text-amber-800/90 dark:text-amber-200/80">
                <span aria-hidden="true" className="mt-[13px] h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                {n}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
