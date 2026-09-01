import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { getAlgorithm } from '../lib/content'
import { cn } from '../lib/utils'

interface Comparison {
  id: string
  title: string
  left: string
  right: string
  rows: Array<{ label: string; left: string; right: string }>
}

const COMPARISONS: Comparison[] = [
  {
    id: 'binary-vs-linear',
    title: 'Binary Search vs Linear Search',
    left: 'binary-search',
    right: 'linear-search',
    rows: [
      { label: 'Purpose', left: 'Find a target in a sorted collection', right: 'Find a target in any collection' },
      { label: 'Strategy', left: 'Halve the range each step', right: 'Scan one element at a time' },
      { label: 'Prerequisite', left: 'Sorted data + random access', right: 'None' },
      { label: 'Best case', left: 'O(1)', right: 'O(1)' },
      { label: 'Average case', left: 'O(log n)', right: 'O(n)' },
      { label: 'Worst case', left: 'O(log n)', right: 'O(n)' },
      { label: 'Space', left: 'O(1)', right: 'O(1)' },
      { label: 'Advantages', left: 'Extremely fast even for huge arrays', right: 'No preprocessing, works on any structure' },
      { label: 'Disadvantages', left: 'Requires sorted input and O(1) indexing', right: 'Slow on large inputs' },
      { label: 'Typical use', left: 'Repeated lookups in static, sorted data', right: 'Small arrays, linked lists, streams' },
    ],
  },
  {
    id: 'merge-vs-quick',
    title: 'Merge Sort vs Quick Sort',
    left: 'merge-sort',
    right: 'quick-sort',
    rows: [
      { label: 'Purpose', left: 'Sort with guaranteed O(n log n)', right: 'Sort with the best average constants' },
      { label: 'Strategy', left: 'Divide, recurse, then merge', right: 'Partition around a pivot, then recurse' },
      { label: 'Best case', left: 'O(n log n)', right: 'O(n log n)' },
      { label: 'Average case', left: 'O(n log n)', right: 'O(n log n)' },
      { label: 'Worst case', left: 'O(n log n)', right: 'O(n²) — poor pivots' },
      { label: 'Space', left: 'O(n) auxiliary', right: 'O(log n) stack (in place)' },
      { label: 'Stable', left: 'Yes', right: 'No (typical partition)' },
      { label: 'Advantages', left: 'Guaranteed bounds, stable', right: 'Cache-friendly, in place, faster average' },
      { label: 'Disadvantages', left: 'Extra memory for merging', right: 'Worst case, unstable' },
      { label: 'Typical use', left: 'Stable sorts, linked lists, external sort', right: 'General in-memory sorting' },
    ],
  },
  {
    id: 'bubble-vs-quick',
    title: 'Bubble Sort vs Quick Sort',
    left: 'bubble-sort',
    right: 'quick-sort',
    rows: [
      { label: 'Purpose', left: 'Learnable, simple O(n²) sort', right: 'Practical, fast in-place sort' },
      { label: 'Strategy', left: 'Swap adjacent out-of-order pairs', right: 'Partition around a pivot' },
      { label: 'Best case', left: 'O(n) — already sorted', right: 'O(n log n)' },
      { label: 'Average case', left: 'O(n²)', right: 'O(n log n)' },
      { label: 'Worst case', left: 'O(n²)', right: 'O(n²) — bad pivots' },
      { label: 'Space', left: 'O(1)', right: 'O(log n)' },
      { label: 'Stable', left: 'Yes', right: 'No' },
      { label: 'Advantages', left: 'Trivial to implement and prove', right: 'Fast average, minimal memory' },
      { label: 'Disadvantages', left: 'O(n²) always in practice', right: 'Tricky partition logic' },
      { label: 'Typical use', left: 'Teaching, tiny inputs', right: 'Production sorting' },
    ],
  },
  {
    id: 'insertion-vs-selection',
    title: 'Insertion Sort vs Selection Sort',
    left: 'insertion-sort',
    right: 'selection-sort',
    rows: [
      { label: 'Purpose', left: 'Sort adaptively for small/nearly sorted input', right: 'Sort while minimizing swaps' },
      { label: 'Strategy', left: 'Insert each element into sorted prefix', right: 'Pick min into its final slot' },
      { label: 'Best case', left: 'O(n)', right: 'O(n²)' },
      { label: 'Average case', left: 'O(n²)', right: 'O(n²)' },
      { label: 'Worst case', left: 'O(n²)', right: 'O(n²)' },
      { label: 'Swaps', left: 'Up to O(n²) shifts', right: 'At most O(n) swaps' },
      { label: 'Stable', left: 'Yes — shifts preserve order', right: 'No — swap breaks ties' },
      { label: 'Advantages', left: 'Adaptive, stable, online', right: 'Few writes, minimal swaps' },
      { label: 'Disadvantages', left: 'Many shifts', right: 'Never benefits from sorted input' },
      { label: 'Typical use', left: 'Nearly sorted data, small arrays', right: 'Costly swap media, small arrays' },
    ],
  },
  {
    id: 'dijkstra-vs-bellman-ford',
    title: "Dijkstra's vs Bellman-Ford",
    left: 'dijkstra',
    right: 'bellman-ford',
    rows: [
      { label: 'Purpose', left: 'Single-source shortest paths', right: 'Single-source shortest paths' },
      { label: 'Edge weights', left: 'Non-negative only', right: 'Negative allowed, no negative cycles' },
      { label: 'Strategy', left: 'Greedy + priority queue', right: 'Relax every edge repeatedly' },
      { label: 'Best case', left: 'O((V + E) log V)', right: 'O(E)' },
      { label: 'Average case', left: 'O((V + E) log V)', right: 'O(V·E)' },
      { label: 'Worst case', left: 'O((V + E) log V)', right: 'O(V·E)' },
      { label: 'Detects negative cycles', left: 'No', right: 'Yes' },
      { label: 'Advantages', left: 'Very fast on sparse graphs', right: 'Handles negatives, cycle detection' },
      { label: 'Disadvantages', left: 'Fails with negative weights', right: 'Slower, more passes needed' },
      { label: 'Typical use', left: 'GPS, networks, A* base', right: 'Currency arbitrage, routing with negatives' },
    ],
  },
]

export function ComparePage() {
  const [activeId, setActiveId] = useState(COMPARISONS[0].id)
  const comparison = COMPARISONS.find((item) => item.id === activeId) ?? COMPARISONS[0]

  const { leftAlg, rightAlg } = useMemo(
    () => ({
      leftAlg: getAlgorithm(comparison.left),
      rightAlg: getAlgorithm(comparison.right),
    }),
    [comparison],
  )

  return (
    <div className="container-page py-10">
      <Breadcrumbs crumbs={[{ label: 'Compare' }]} />
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Algorithm comparisons</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Which algorithm should you reach for? These side-by-side breakdowns show where each
          one wins and where it breaks.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {COMPARISONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            className={cn(
              'chip cursor-pointer font-medium transition-colors',
              activeId === item.id
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-indigo-300'
                : 'hover:border-indigo-300',
            )}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="w-40 px-4 py-3 font-semibold text-slate-400" />
              {[
                { slug: comparison.left, label: leftAlg?.meta.title ?? comparison.left },
                { slug: comparison.right, label: rightAlg?.meta.title ?? comparison.right },
              ].map((column) => (
                <th key={column.slug} className="px-4 py-3">
                  {getAlgorithm(column.slug) ? (
                    <Link
                      to={`/algorithms/${column.slug}`}
                      className="text-base font-bold text-slate-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                    >
                      {column.label}
                    </Link>
                  ) : (
                    <span className="text-base font-bold text-slate-900 dark:text-white">{column.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr key={row.label} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{row.label}</td>
                <td className="px-4 py-3 align-top leading-relaxed text-slate-700 dark:text-slate-300">{row.left}</td>
                <td className="px-4 py-3 align-top leading-relaxed text-slate-700 dark:text-slate-300">{row.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        Want another head-to-head? <Link to="/algorithms" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Browse the atlas</Link> and suggest a pairing on GitHub.
      </p>
    </div>
  )
}