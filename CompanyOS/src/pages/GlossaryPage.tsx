import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { glossary, glossaryByLetter } from "../content/glossary";
import { usePageMeta } from "../lib/seo";
import { PageHeader } from "../components/PageHeader";
import { SearchIcon } from "../components/icons";

export function GlossaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("term") ?? "");

  usePageMeta("Glossary", `${glossary.length}+ business terms with definitions, plain-language explanations, and real examples.`);

  useEffect(() => {
    const t = searchParams.get("term");
    if (t !== null) setQuery(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = q
      ? glossary.filter((t) =>
          `${t.term} ${t.definition} ${t.simple}`.toLowerCase().includes(q),
        )
      : glossary;
    const sorted = [...source].sort((a, b) => a.term.localeCompare(b.term));
    const map = new Map<string, typeof glossary>();
    for (const term of sorted) {
      const letter = term.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(term);
    }
    return map;
  }, [query]);

  const letters = useMemo(() => glossaryByLetter(), []);

  return (
    <>
      <PageHeader
        eyebrow="Vocabulary"
        title="Business Glossary"
        description="Every term you'll hear in meetings — decoded. Each entry gives the formal definition, a simple explanation, and an example."
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search + alphabet nav */}
        <div className="sticky top-16 z-10 -mx-4 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setSearchParams({}, { replace: true });
                }}
                placeholder={`Search ${glossary.length} terms…`}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                aria-label="Search glossary"
              />
            </div>
            {!query && (
              <nav className="flex flex-wrap gap-1" aria-label="Alphabetical index">
                {[...letters.keys()].map((letter) => (
                  <a
                    key={letter}
                    href={`#glossary-${letter}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium text-zinc-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                  >
                    {letter}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Terms */}
        {grouped.size === 0 ? (
          <p className="py-20 text-center text-sm text-zinc-500">
            No terms match “{query}”.
          </p>
        ) : (
          [...grouped.entries()].map(([letter, terms]) => (
            <section key={letter} id={`glossary-${letter}`} className="scroll-mt-36 pt-10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-500">
                {letter}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {terms.map((t) => (
                  <article
                    key={t.term}
                    id={`term-${t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="scroll-mt-40 rounded-xl border border-zinc-200 p-5 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-500/40"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{t.term}</h3>
                      <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {t.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {t.definition}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                      <span className="font-medium text-zinc-600 dark:text-zinc-300">Simply: </span>
                      {t.simple}
                    </p>
                    <p className="mt-2 rounded-lg bg-emerald-50/70 px-3 py-2 text-sm leading-6 text-emerald-800/90 dark:bg-emerald-500/5 dark:text-emerald-200/80">
                      <span className="font-semibold">Example: </span>
                      {t.example}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
