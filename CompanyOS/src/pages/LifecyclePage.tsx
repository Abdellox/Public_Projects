import { lifecycleStages } from "../content/lifecycle";
import { usePageMeta } from "../lib/seo";
import { PageHeader } from "../components/PageHeader";

const fields: { key: keyof (typeof lifecycleStages)[0]; label: string }[] = [
  { key: "structure", label: "Typical structure" },
  { key: "managementStyle", label: "Management style" },
  { key: "departments", label: "Departments" },
  { key: "decisionMaking", label: "Decision making" },
  { key: "processes", label: "Processes" },
  { key: "technology", label: "Technology" },
  { key: "hiring", label: "Hiring" },
];

export function LifecyclePage() {
  usePageMeta("Company Lifecycle", "How organizations evolve from startup to enterprise — structure, management, decision-making, and challenges at every stage.");

  return (
    <>
      <PageHeader
        eyebrow="Growth stages"
        title="Company Lifecycle"
        description="Organizations transform as they grow. The same job, the same title — completely different reality depending on stage."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Stage progression */}
        <div className="mb-14 flex flex-col items-center gap-y-2 sm:flex-row sm:justify-center sm:gap-x-3">
          {lifecycleStages.map((s, i) => (
            <span key={s.id} className="flex items-center gap-3 sm:gap-x-3">
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-indigo-400"
              >
                {s.name}
              </a>
              {i < lifecycleStages.length - 1 && (
                <svg viewBox="0 0 24 24" className="hidden h-4 w-4 text-zinc-300 sm:block dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              )}
            </span>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-16 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60">
                <th scope="col" className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400">Stage</th>
                {lifecycleStages.map((s) => (
                  <th key={s.id} scope="col" className="px-5 py-3.5 font-semibold text-zinc-800 dark:text-zinc-200">
                    {s.name}
                    <span className="block text-xs font-normal text-zinc-400">{s.size}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {fields.map((f) => (
                <tr key={f.key}>
                  <th scope="row" className="px-5 py-3.5 align-top text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    {f.label}
                  </th>
                  {lifecycleStages.map((s) => (
                    <td key={s.id} className="px-5 py-3.5 align-top leading-6 text-zinc-600 dark:text-zinc-400">
                      {String(s[f.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stage details */}
        <div className="space-y-10">
          {lifecycleStages.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24 rounded-2xl border border-zinc-200 p-6 sm:p-8 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {s.name}
                </h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {s.size}
                </span>
              </div>
              <p className="mt-2 leading-7 text-zinc-500 dark:text-zinc-400">{s.summary}</p>

              <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.key}>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                      {f.label}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {String(s[f.key])}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 rounded-xl border border-red-200/70 bg-red-50/50 p-5 dark:border-red-500/25 dark:bg-red-500/5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Main challenges
                </h3>
                <ul className="mt-3 space-y-2 pl-1">
                  {s.challenges.map((c, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      <span aria-hidden="true" className="mt-[13px] h-1 w-1 shrink-0 rounded-full bg-red-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
