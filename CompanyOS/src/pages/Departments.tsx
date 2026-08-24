import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  departmentBySlug,
  departmentGroups,
  departments,
} from "../content/departments";
import { usePageMeta } from "../lib/seo";
import { Badge } from "../components/ArticleLayout";
import { CardLink, PageHeader } from "../components/PageHeader";
import { SearchIcon } from "../components/icons";
import { NotFound } from "./NotFound";

export function DepartmentsIndex() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);

  usePageMeta("Departments", "All 12 company departments explained: responsibilities, roles, KPIs, terminology, and real-world workflows.");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return departments.filter((d) => {
      if (group && d.group !== group) return false;
      if (!q) return true;
      return `${d.name} ${d.tagline} ${d.responsibilities.join(" ")}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, group]);

  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Departments"
        description="Every department of a typical company: what it does, why it exists, who works there, which numbers it watches, and how a real workflow runs."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter departments…"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              aria-label="Filter departments"
            />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by group">
            <FilterChip active={group === null} onClick={() => setGroup(null)}>
              All ({departments.length})
            </FilterChip>
            {departmentGroups.map((g) => (
              <FilterChip
                key={g}
                active={group === g}
                onClick={() => setGroup(group === g ? null : g)}
              >
                {g}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <CardLink
              key={d.slug}
              to={`/departments/${d.slug}`}
              title={d.name}
              description={d.tagline}
              footer={
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${d.accent}`}>
                  {d.monogram}
                </span>
              }
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-zinc-500">
            No departments match “{query}”.
          </p>
        )}
      </div>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
          : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

export function DepartmentPage() {
  const { slug } = useParams<{ slug: string }>();
  const dept = slug ? departmentBySlug(slug) : undefined;

  usePageMeta(dept ? `${dept.name} department` : "Department not found");

  if (!dept) return <NotFound />;

  const idx = departments.findIndex((d) => d.slug === dept.slug);
  const prev = idx > 0 ? departments[idx - 1] : departments[departments.length - 1];
  const next = idx < departments.length - 1 ? departments[idx + 1] : departments[0];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-zinc-400">
              <li><Link to="/" className="hover:text-indigo-500">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link to="/departments" className="hover:text-indigo-500">Departments</Link></li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-zinc-600 dark:text-zinc-300">{dept.name}</li>
            </ol>
          </nav>

          <div className="flex items-start gap-5">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-bold ring-1 ${dept.accent}`}>
              {dept.monogram}
            </span>
            <div>
              <Badge>{dept.group}</Badge>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                The {dept.name} Department
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-500 dark:text-zinc-400">
                {dept.tagline}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] xl:gap-16">
          <article className="max-w-3xl space-y-12">
            <Block title="What this department does">
              {dept.whatItDoes.map((p, i) => (
                <p key={i} className="leading-7 text-zinc-600 dark:text-zinc-400">{p}</p>
              ))}
            </Block>

            <Block title="Why it exists">
              <ul className="space-y-2.5 pl-1">
                {dept.whyItExists.map((w, i) => (
                  <li key={i} className="flex gap-2.5 leading-7 text-zinc-600 dark:text-zinc-400">
                    <span aria-hidden="true" className="mt-[15px] h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </Block>

            <Block title="Main responsibilities">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {dept.responsibilities.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3.5 text-sm leading-6 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300"
                  >
                    {r}
                  </div>
                ))}
              </div>
            </Block>

            <Block title="Typical roles">
              <div className="space-y-3">
                {dept.roles.map((r) => (
                  <div key={r.title} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{r.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{r.description}</p>
                  </div>
                ))}
              </div>
            </Block>

            <Block title="Important KPIs">
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {dept.kpis.map((k) => (
                      <tr key={k.name}>
                        <th scope="row" className="w-1/3 bg-zinc-50/70 px-4 py-3 align-top font-semibold text-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
                          {k.name}
                        </th>
                        <td className="px-4 py-3 leading-6 text-zinc-500 dark:text-zinc-400">{k.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>

            <Block title="Common terminology">
              <dl className="grid gap-4 sm:grid-cols-2">
                {dept.terminology.map((t) => (
                  <div key={t.term} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <dt className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t.term}</dt>
                    <dd className="mt-1.5 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{t.definition}</dd>
                  </div>
                ))}
              </dl>
            </Block>

            <Block title="Who they work with">
              <div className="space-y-3">
                {dept.worksWith.map((w) => (
                  <div key={w.department} className="flex flex-col gap-1 rounded-xl bg-zinc-50/70 p-4 sm:flex-row sm:gap-4 dark:bg-zinc-900/50">
                    <span className="w-40 shrink-0 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {w.department}
                    </span>
                    <span className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">{w.how}</span>
                  </div>
                ))}
              </div>
            </Block>

            <Block title="Example workflow">
              <ol className="relative space-y-6 border-l border-zinc-200 pl-6 dark:border-zinc-800">
                {dept.workflow.map((s, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.step}</h4>
                    <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{s.detail}</p>
                  </li>
                ))}
              </ol>
            </Block>

            {/* Prev / Next */}
            <nav className="grid gap-4 border-t border-zinc-200 pt-8 sm:grid-cols-2 dark:border-zinc-800" aria-label="Adjacent departments">
              <Link to={`/departments/${prev.slug}`} className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-500/40">
                <span className="text-xs text-zinc-400">← Previous</span>
                <span className="mt-1 block font-medium text-zinc-900 dark:text-zinc-100">{prev.name}</span>
              </Link>
              <Link to={`/departments/${next.slug}`} className="rounded-xl border border-zinc-200 p-4 text-right transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-500/40">
                <span className="text-xs text-zinc-400">Next →</span>
                <span className="mt-1 block font-medium text-zinc-900 dark:text-zinc-100">{next.name}</span>
              </Link>
            </nav>
          </article>

          {/* TOC sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800" aria-label="On this page">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">On this page</p>
              <ul className="space-y-0 border-l border-zinc-200 pl-0 dark:border-zinc-800">
                {[
                  ["what-it-does", "What this department does"],
                  ["why-exists", "Why it exists"],
                  ["responsibilities", "Main responsibilities"],
                  ["roles", "Typical roles"],
                  ["kpis", "Important KPIs"],
                  ["terminology", "Common terminology"],
                  ["works-with", "Who they work with"],
                  ["workflow", "Example workflow"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <button
                      key={id}
                      onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                      className="block w-full py-1 pl-4 text-left text-sm text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section id={idFor(title)} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function idFor(title: string): string {
  switch (title) {
    case "What this department does": return "what-it-does";
    case "Why it exists": return "why-exists";
    case "Main responsibilities": return "responsibilities";
    case "Typical roles": return "roles";
    case "Important KPIs": return "kpis";
    case "Common terminology": return "terminology";
    case "Who they work with": return "works-with";
    default: return "workflow";
  }
}
