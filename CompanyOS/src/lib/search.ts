import { departments } from "../content/departments";
import { fundamentals } from "../content/fundamentals";
import { glossary } from "../content/glossary";
import { guides } from "../content/guides";
import { lessons } from "../content/lessons";
import { scenarios } from "../content/scenarios";

export interface SearchEntry {
  type: string;
  title: string;
  description: string;
  path: string;
}

let indexCache: SearchEntry[] | null = null;

export function buildSearchIndex(): SearchEntry[] {
  if (indexCache) return indexCache;
  const entries: SearchEntry[] = [];

  for (const l of lessons)
    entries.push({
      type: "Lesson",
      title: `${String(l.number).padStart(2, "0")} · ${l.title}`,
      description: l.description,
      path: `/start-here/${l.slug}`,
    });
  for (const g of guides)
    entries.push({ type: "Guide", title: g.title, description: g.description, path: `/how-companies-work/${g.slug}` });
  for (const d of departments)
    entries.push({ type: "Department", title: d.name, description: d.tagline, path: `/departments/${d.slug}` });
  for (const f of fundamentals)
    entries.push({ type: "Fundamental", title: f.name, description: f.simpleDefinition, path: `/fundamentals/${f.slug}` });
  for (const s of scenarios)
    entries.push({ type: "Scenario", title: s.title, description: s.intro, path: `/scenarios/${s.slug}` });
  for (const t of glossary)
    entries.push({
      type: "Glossary",
      title: t.term,
      description: t.definition,
      path: `/glossary?term=${encodeURIComponent(t.term.toLowerCase())}`,
    });

  indexCache = entries;
  return entries;
}

export function searchContent(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const index = buildSearchIndex();
  const terms = q.split(/\s+/);

  return index
    .map((entry) => {
      const haystack = `${entry.title} ${entry.description}`.toLowerCase();
      let score = 0;
      for (const term of terms) {
        const idx = entry.title.toLowerCase().indexOf(term);
        if (idx >= 0) score += idx === 0 ? 30 : 15;
        else if (haystack.includes(term)) score += 5;
        else return null;
      }
      return { entry, score };
    })
    .filter((r): r is { entry: SearchEntry; score: number } => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((r) => r.entry);
}
