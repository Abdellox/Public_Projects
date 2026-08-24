import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fundamentalBySlug,
  fundamentalCategories,
  fundamentals,
} from "../content/fundamentals";
import { glossary } from "../content/glossary";
import { usePageMeta } from "../lib/seo";
import { Badge } from "../components/ArticleLayout";
import { CardLink, PageHeader } from "../components/PageHeader";
import { NotFound } from "./NotFound";

export function FundamentalsIndex() {
  const [category, setCategory] = useState<string | null>(null);

  usePageMeta("Business Fundamentals", "Revenue, costs, profit, cash flow, KPIs and more — every core business concept explained simply, with why it matters and a real example.");

  const filtered = useMemo(
    () => (category ? fundamentals.filter((f) => f.category === category) : fundamentals),
    [category],
  );

  return (
    <>
      <PageHeader
        eyebrow="Money & metrics literacy"
        title="Business Fundamentals"
        description="The vocabulary of business, explained for someone who has never studied it. Each concept: simple definition → why it matters → real-world example."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          <Chip active={category === null} onClick={() => setCategory(null)}>
            All ({fundamentals.length})
          </Chip>
          {fundamentalCategories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
              {c}
            </Chip>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <CardLink
              key={f.slug}
              to={`/fundamentals/${f.slug}`}
              title={f.name}
              description={f.tagline}
              footer={<Badge tone="indigo">{f.category}</Badge>}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function Chip({
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

function CalloutBox({
  label,
  children,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  tone: "indigo" | "amber" | "green";
}) {
  const tones = {
    indigo:
      "border-indigo-200 bg-indigo-50/60 dark:border-indigo-500/30 dark:bg-indigo-500/5",
    amber:
      "border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/5",
    green:
      "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5",
  };
  const labels = {
    indigo: "text-indigo-700 dark:text-indigo-300",
    amber: "text-amber-700 dark:text-amber-300",
    green: "text-emerald-700 dark:text-emerald-300",
  };
  return (
    <div className={`rounded-xl border p-5 ${tones[tone]}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${labels[tone]}`}>
        {label}
      </p>
      <p className="mt-2 leading-7 text-zinc-700 dark:text-zinc-300">{children}</p>
    </div>
  );
}

export function FundamentalPage() {
  const { slug } = useParams<{ slug: string }>();
  const concept = slug ? fundamentalBySlug(slug) : undefined;

  usePageMeta(concept ? concept.name : "Concept not found");

  if (!concept) return <NotFound />;

  const related = concept.related
    .map((r) => {
      const asFundamental = fundamentals.find((f) => f.slug === r);
      if (asFundamental)
        return {
          title: asFundamental.name,
          to: `/fundamentals/${asFundamental.slug}`,
          description: asFundamental.tagline,
          internal: true,
        };
      const asGlossary = glossary.find(
        (t) => t.term.toLowerCase().replace(/[^a-z]/g, "") === r.replace(/-/g, ""),
      );
      if (asGlossary)
        return {
          title: asGlossary.term,
          to: `/glossary?term=${encodeURIComponent(asGlossary.term.toLowerCase())}`,
          description: asGlossary.simple,
          internal: true,
        };
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const idx = fundamentals.findIndex((f) => f.slug === concept.slug);
  const prev = idx > 0 ? fundamentals[idx - 1] : fundamentals[fundamentals.length - 1];
  const next = idx < fundamentals.length - 1 ? fundamentals[idx + 1] : fundamentals[0];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-zinc-400">
          <li><Link to="/" className="hover:text-indigo-500">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/fundamentals" className="hover:text-indigo-500">Fundamentals</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-zinc-600 dark:text-zinc-300">{concept.name}</li>
        </ol>
      </nav>

      <header className="mb-10">
        <Badge tone="indigo">{concept.category}</Badge>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {concept.name}
        </h1>
        <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">{concept.tagline}</p>
      </header>

      <div className="space-y-6">
        <CalloutBox label="Simple definition" tone="indigo">
          {concept.simpleDefinition}
        </CalloutBox>
        <CalloutBox label="Why it matters" tone="amber">
          {concept.whyItMatters}
        </CalloutBox>
        <CalloutBox label="Example" tone="green">
          {concept.example}
        </CalloutBox>

        <section className="pt-4">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Key points
          </h2>
          <ul className="mt-4 space-y-2.5 pl-1">
            {concept.keyPoints.map((k, i) => (
              <li key={i} className="flex gap-2.5 leading-7 text-zinc-600 dark:text-zinc-400">
                <span aria-hidden="true" className="mt-[15px] h-1 w-1 shrink-0 rounded-full bg-indigo-500" />
                {k}
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="pt-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Related concepts
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.to}
                  to={r.to}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        <nav className="grid gap-4 border-t border-zinc-200 pt-8 sm:grid-cols-2 dark:border-zinc-800" aria-label="Adjacent concepts">
          <Link to={`/fundamentals/${prev.slug}`} className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-500/40">
            <span className="text-xs text-zinc-400">← Previous</span>
            <span className="mt-1 block font-medium text-zinc-900 dark:text-zinc-100">{prev.name}</span>
          </Link>
          <Link to={`/fundamentals/${next.slug}`} className="rounded-xl border border-zinc-200 p-4 text-right transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-500/40">
            <span className="text-xs text-zinc-400">Next →</span>
            <span className="mt-1 block font-medium text-zinc-900 dark:text-zinc-100">{next.name}</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
