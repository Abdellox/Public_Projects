import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlgorithmCard } from '../components/AlgorithmCard'
import { Badge } from '../components/ui/Badge'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { categories } from '../data/categories'
import { algorithms, searchAlgorithms } from '../lib/content'
import type { Difficulty } from '../types/algorithm'
import { DIFFICULTY_LABELS } from '../types/algorithm'
import { cn } from '../lib/utils'

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced']

export function AlgorithmsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') ?? ''
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('')

  const results = useMemo(() => {
    const base = activeCategory ? algorithms.filter((alg) => alg.meta.category === activeCategory) : algorithms
    const queried = query ? searchAlgorithms(query).filter((alg) => base.includes(alg)) : base
    return queried.filter((alg) => !difficulty || alg.meta.difficulty === difficulty)
  }, [activeCategory, query, difficulty])

  const setCategory = (category: string) => {
    if (category) setSearchParams({ category })
    else setSearchParams({})
  }

  const hasFilters = Boolean(query || difficulty || activeCategory)

  const clearFilters = () => {
    setQuery('')
    setDifficulty('')
    setSearchParams({})
  }

  return (
    <div className="container-page py-10">
      <Breadcrumbs crumbs={[{ label: 'Algorithms' }]} />
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Algorithms</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {algorithms.length} explained so far — every one with intuition, complexity, and code.
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search "binary search", "shortest path", "sorting", "dynamic programming"…'
            aria-label="Search algorithms"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Category
          </span>
          <button
            type="button"
            onClick={() => setCategory('')}
            className={cn(
              'chip cursor-pointer transition-colors',
              !activeCategory && 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-indigo-300',
            )}
          >
            All
          </button>
          {categories
            .filter((category) => algorithms.some((alg) => alg.meta.category === category.slug))
            .map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => setCategory(activeCategory === category.slug ? '' : category.slug)}
                className={cn(
                  'chip cursor-pointer transition-colors',
                  activeCategory === category.slug &&
                    'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-indigo-300',
                )}
              >
                {category.name}
              </button>
            ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Difficulty</span>
          {DIFFICULTIES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDifficulty(difficulty === value ? '' : value)}
              className={cn(
                'chip cursor-pointer transition-colors',
                difficulty === value &&
                  'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-indigo-300',
              )}
            >
              {DIFFICULTY_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {hasFilters ? (
        <div className="mb-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear all filters
          </button>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((alg) => (
            <AlgorithmCard key={alg.slug} algorithm={alg} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden />
          <p className="font-medium text-slate-700 dark:text-slate-200">No algorithms match your search</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try a different query, or clear the filters to browse everything.
          </p>
          <button type="button" onClick={clearFilters} className="mt-1">
            <Badge variant="accent" className="cursor-pointer">Clear filters</Badge>
          </button>
        </div>
      )}
    </div>
  )
}