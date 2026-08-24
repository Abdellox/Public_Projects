import { Link, useParams } from "react-router-dom";
import { scenarioBySlug, scenarios } from "../content/scenarios";
import { usePageMeta } from "../lib/seo";
import { CardLink, PageHeader } from "../components/PageHeader";
import { departments } from "../content/departments";
import { NotFound } from "./NotFound";

export function ScenariosIndex() {
  usePageMeta("Real-World Scenarios", "Realistic business situations deconstructed: what happened, which departments care, what data matters, who decides, what happens next.");

  return (
    <>
      <PageHeader
        eyebrow="Applied learning"
        title="Real-World Scenarios"
        description="Theory means little until you see it under pressure. Each scenario walks through a real business situation the way a company actually experiences it."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => (
            <CardLink
              key={s.slug}
              to={`/scenarios/${s.slug}`}
              title={s.title}
              description={s.hook}
              footer={
                <span className="text-xs font-medium text-zinc-400">
                  {s.departmentsInvolved.length} departments involved
                </span>
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ScenarioBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 pl-1">
      {items.map((b, i) => (
        <li key={i} className="flex gap-2.5 leading-7 text-zinc-600 dark:text-zinc-400">
          <span aria-hidden="true" className="mt-[15px] h-1 w-1 shrink-0 rounded-full bg-indigo-500" />
          {b}
        </li>
      ))}
    </ul>
  );
}

export function ScenarioPage() {
  const { slug } = useParams<{ slug: string }>();
  const scenario = slug ? scenarioBySlug(slug) : undefined;

  usePageMeta(scenario ? scenario.title : "Scenario not found");

  if (!scenario) return <NotFound />;

  const idx = scenarios.findIndex((s) => s.slug === scenario.slug);
  const prev = idx > 0 ? scenarios[idx - 1] : scenarios[scenarios.length - 1];
  const next = idx < scenarios.length - 1 ? scenarios[idx + 1] : scenarios[0];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-zinc-400">
          <li><Link to="/" className="hover:text-indigo-500">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/scenarios" className="hover:text-indigo-500">Scenarios</Link></li>
          <li aria-hidden="true">/</li>
          <li className="line-clamp-1 font-medium text-zinc-600 dark:text-zinc-300">{scenario.title}</li>
        </ol>
      </nav>

      <header className="mb-12">
        <p className="mb-4 border-l-4 border-indigo-500 pl-4 text-xl font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
          “{scenario.hook}”
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          {scenario.title}
        </h1>
        <p className="mt-4 text-lg leading-7 text-zinc-500 dark:text-zinc-400">
          {scenario.intro}
        </p>
      </header>

      <div className="space-y-12">
        <ScenarioBlock title="What happened?">
          <Bullets items={scenario.whatHappened} />
        </ScenarioBlock>

        <ScenarioBlock title="Which departments care — and why?">
          <div className="space-y-3">
            {scenario.departmentsInvolved.map((d) => {
              const dept = departments.find(
                (x) => x.name.toLowerCase() === d.name.toLowerCase(),
              );
              return (
                <div key={d.name} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-2">
                    {dept && (
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ring-1 ${dept.accent}`}>
                        {dept.monogram}
                      </span>
                    )}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{d.name}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{d.concern}</p>
                </div>
              );
            })}
          </div>
        </ScenarioBlock>

        <ScenarioBlock title="What data would they investigate?">
          <Bullets items={scenario.dataToInvestigate} />
        </ScenarioBlock>

        <ScenarioBlock title="Who makes decisions?">
          <Bullets items={scenario.decisionMakers} />
        </ScenarioBlock>

        <ScenarioBlock title="What actions might follow?">
          <Bullets items={scenario.possibleActions} />
        </ScenarioBlock>

        <aside className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-6 dark:border-indigo-500/30 dark:bg-indigo-500/5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
            The takeaway
          </h2>
          <p className="mt-2 leading-7 text-zinc-700 dark:text-zinc-300">
            {scenario.takeaway}
          </p>
        </aside>

        <nav className="grid gap-4 border-t border-zinc-200 pt-8 sm:grid-cols-2 dark:border-zinc-800" aria-label="Adjacent scenarios">
          <Link to={`/scenarios/${prev.slug}`} className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-500/40">
            <span className="text-xs text-zinc-400">← Previous</span>
            <span className="mt-1 block font-medium text-zinc-900 dark:text-zinc-100">{prev.title}</span>
          </Link>
          <Link to={`/scenarios/${next.slug}`} className="rounded-xl border border-zinc-200 p-4 text-right transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-500/40">
            <span className="text-xs text-zinc-400">Next →</span>
            <span className="mt-1 block font-medium text-zinc-900 dark:text-zinc-100">{next.title}</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
