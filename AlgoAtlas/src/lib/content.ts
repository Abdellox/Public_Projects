import type { Algorithm, AlgorithmMeta, Difficulty } from '../types/algorithm'
import { parseFrontmatter } from './parse-frontmatter'

// Vite turns these glob matches into eager raw string imports at build time.
const modules = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced']

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringArray(value: unknown, fallback: string[] = []): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : fallback
}

function asDifficulty(value: unknown): Difficulty {
  return DIFFICULTIES.includes(value as Difficulty) ? (value as Difficulty) : 'beginner'
}

function parseMetadata(slug: string, rawMeta: Record<string, unknown>): AlgorithmMeta {
  return {
    title: asString(rawMeta.title, slug),
    category: asString(rawMeta.category),
    difficulty: asDifficulty(rawMeta.difficulty),
    aka: asStringArray(rawMeta.aka),
    short: asString(rawMeta.short),
    best: asString(rawMeta.best) || undefined,
    average: asString(rawMeta.average),
    worst: asString(rawMeta.worst),
    space: asString(rawMeta.space),
    stable: typeof rawMeta.stable === 'boolean' ? rawMeta.stable : undefined,
    inPlace: typeof rawMeta.inPlace === 'boolean' ? rawMeta.inPlace : undefined,
    visualizable: rawMeta.visualizable === true,
    related: asStringArray(rawMeta.related),
    tags: asStringArray(rawMeta.tags),
  }
}

function slugFromPath(path: string): string {
  const base = path.split('/').pop() ?? ''
  return base.replace(/\.md$/, '')
}

function buildAlgorithm(path: string, raw: string): Algorithm {
  const slug = slugFromPath(path)
  const { data, body } = parseFrontmatter(raw)
  return { slug, meta: parseMetadata(slug, data), body }
}

export const algorithms: Algorithm[] = Object.entries(modules)
  .map(([path, raw]) => buildAlgorithm(path, raw))
  .sort((a, b) => a.meta.title.localeCompare(b.meta.title))

export const algorithmMap: Record<string, Algorithm> = Object.fromEntries(
  algorithms.map((alg) => [alg.slug, alg]),
)

export function getAlgorithm(slug: string): Algorithm | undefined {
  return algorithmMap[slug]
}

export function getAlgorithmsByCategory(category: string): Algorithm[] {
  return algorithms.filter((alg) => alg.meta.category === category)
}

export function getRelatedAlgorithms(alg: Algorithm): Algorithm[] {
  return (alg.meta.related ?? [])
    .map((slug) => algorithmMap[slug])
    .filter((item): item is Algorithm => Boolean(item))
}

export function getPopularAlgorithms(limit = 6): Algorithm[] {
  const featured = ['binary-search', 'bubble-sort', 'merge-sort', 'quick-sort', 'dijkstra', 'knapsack-01']
  const ordered: Algorithm[] = []
  for (const slug of featured) {
    const alg = algorithmMap[slug]
    if (alg) ordered.push(alg)
  }
  const rest = algorithms.filter((alg) => !ordered.includes(alg))
  return [...ordered, ...rest].slice(0, limit)
}

export function searchAlgorithms(query: string): Algorithm[] {
  const q = query.trim().toLowerCase()
  const terms = q.split(/\s+/).filter(Boolean)
  if (terms.length === 0) return algorithms
  return algorithms.filter((alg) => {
    const haystack = [
      alg.slug,
      alg.meta.title,
      alg.meta.category,
      ...(alg.meta.aka ?? []),
      ...(alg.meta.tags ?? []),
    ]
      .join(' ')
      .toLowerCase()
    return terms.every((term) => haystack.includes(term))
  })
}