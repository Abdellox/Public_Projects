import { Link } from "react-router-dom";
import { departments } from "../content/departments";
import { fundamentals } from "../content/fundamentals";
import { glossary } from "../content/glossary";
import { lessons } from "../content/lessons";
import { scenarios } from "../content/scenarios";
import { lifecycleStages } from "../content/lifecycle";
import { usePageMeta } from "../lib/seo";
import { ArrowRightIcon, BookIcon, ChevronRightIcon, ClockIcon } from "../components/icons";
import { CardLink, SectionHeading } from "../components/PageHeader";

const heroDepartments = [
  "Finance",
  "Sales",
  "Marketing",
  "Product",
  "Engineering",
  "Operations",
  "HR",
  "Legal",
];

function OrgChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
      {children}
    </span>
  );
}

function Connector() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-700" />
    </div>
  );
}

function CompanyMap() {
  return (
    <div
      className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/40"
      aria-label="Company map: from CEO to growth"
    >
      <div className="flex flex-col items-center">
        <Link to="/departments/executive">
          <span className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-colors hover:bg-indigo-500">
            CEO
          </span>
        </Link>
        <Connector />
        <OrgChip>Leadership Team</OrgChip>
        <Connector />
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
          {heroDepartments.map((name) => {
            const dept = departments.find((d) => d.name === name);
            const slug = name === "HR" ? "human-resources" : name.toLowerCase();
            return (
              <Link
                key={name}
                to={`/departments/${dept?.slug ?? slug}`}
                className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 py-2 text-xs font-medium text-zinc-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400"
              >
                {name}
              </Link>
            );
          })}
        </div>
        <Connector />
        <OrgChip>Customers</OrgChip>
        <Connector />
        <OrgChip>Revenue</OrgChip>
        <Connector />
        <span className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25">
          Growth
        </span>
      </div>
    </div>
  );
}

export function Home() {
  usePageMeta("Understand how companies work", "CompanyOS is an open-source handbook that explains how companies work — departments, hierarchy, business fundamentals, and real-world scenarios.");

  const glossaryPreview = [
    "Revenue", "Profit", "EBITDA", "KPI", "OKR", "ROI",
    "CAC", "LTV", "ARR", "MRR", "Burn Rate", "Runway", "Stakeholder",
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            <BookIcon className="h-3.5 w-3.5" />
            Open-source business handbook
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-50">
            Understand how{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              companies
            </span>{" "}
            work.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-500 dark:text-zinc-400">
            A practical guide to the people, departments, decisions, money, and
            systems behind every company — written for absolute beginners.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/start-here"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-colors hover:bg-indigo-500"
            >
              Start Learning <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              to="/how-companies-work"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Explore the Handbook
            </Link>
          </div>

          <div className="mt-14 sm:mt-16">
            <CompanyMap />
            <p className="mt-4 text-xs text-zinc-400">
              Click any box to explore the corresponding guide
            </p>
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="border-b border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-xl font-medium leading-relaxed tracking-tight text-zinc-700 sm:text-2xl dark:text-zinc-300">
            “Most people learn their job. Few people learn how the whole company
            works.”{" "}
            <span className="text-zinc-400 dark:text-zinc-500">
              CompanyOS closes that gap.
            </span>
          </p>
        </div>
      </section>

      {/* 01 Start Here */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="01 · Guided path"
            title="Start Here"
            description="Ten short lessons take you from 'what is a company?' to seeing the whole system. No prior knowledge required."
            linkTo="/start-here"
            linkLabel="Open the course"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {lessons.slice(0, 5).map((l) => (
              <Link
                key={l.slug}
                to={`/start-here/${l.slug}`}
                className="group rounded-xl border border-zinc-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-zinc-800 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/5"
              >
                <span className="text-xs font-semibold text-indigo-500">
                  {String(l.number).padStart(2, "0")}
                </span>
                <h3 className="mt-1.5 text-sm font-semibold leading-5 text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {l.title}
                </h3>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-400">
                  <ClockIcon className="h-3 w-3" /> {l.readingTime} min · {l.level}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 02 Departments */}
      <section className="border-b border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="02 · Reference"
            title="Explore Departments"
            description="Every department explained: what it does, why it exists, its roles, KPIs, vocabulary, and a real workflow."
            linkTo="/departments"
          />
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <Link
                key={d.slug}
                to={`/departments/${d.slug}`}
                className={`group inline-flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white py-1.5 pl-2 pr-4 text-sm text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 ${d.accent}`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ring-1 ${d.accent}`}>
                  <span className="text-[10px] font-bold">{d.monogram}</span>
                </span>
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 03 Business Fundamentals */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="03 · Money literacy"
            title="Understand Business"
            description="Revenue, costs, profit, cash flow, KPIs, budgets, strategy — every concept with a simple definition, why it matters, and an example."
            linkTo="/fundamentals"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fundamentals.slice(0, 9).map((f) => (
              <CardLink
                key={f.slug}
                to={`/fundamentals/${f.slug}`}
                title={f.name}
                description={f.tagline}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 04 Hierarchy */}
      <section className="border-b border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="04 · People"
            title="Understand Hierarchy"
            description="From intern to CEO — what each level actually does, who reports to whom, and how careers really progress."
            linkTo="/roles"
          />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            {["Intern", "Junior", "Mid-level", "Senior", "Lead", "Manager", "Director", "VP", "C-Level", "CEO"].map(
              (r, i, arr) => (
                <span key={r} className="flex items-center gap-2">
                  <span className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    {r}
                  </span>
                  {i < arr.length - 1 && (
                    <ChevronRightIcon className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                  )}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 05 Scenarios */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="05 · Applied learning"
            title="Learn Through Scenarios"
            description="Real business situations deconstructed: what happened, which departments care, what data matters, who decides, what happens next."
            linkTo="/scenarios"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.slice(0, 6).map((s) => (
              <CardLink
                key={s.slug}
                to={`/scenarios/${s.slug}`}
                title={s.title}
                description={s.hook}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 06 Company size */}
      <section className="border-b border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="06 · Context"
            title="Compare Company Sizes"
            description="The same job feels completely different depending on company stage. Learn what changes as organizations grow."
            linkTo="/lifecycle"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lifecycleStages.slice(0, 4).map((stage) => (
              <CardLink
                key={stage.id}
                to={`/lifecycle#${stage.id}`}
                title={stage.name}
                description={stage.summary}
                footer={
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {stage.size}
                  </span>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* 07 Glossary */}
      <section className="dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="07 · Vocabulary"
            title="Business Glossary"
            description={`${glossary.length}+ terms decoded with plain-language definitions and examples. Press ⌘K anywhere to search.`}
            linkTo="/glossary"
          />
          <div className="flex flex-wrap gap-2">
            {glossaryPreview.map((term) => {
              const entry = glossary.find((t) => t.term === term);
              if (!entry) return null;
              return (
                <Link
                  key={term}
                  to={`/glossary?term=${encodeURIComponent(term.toLowerCase())}`}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400"
                >
                  {term}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
