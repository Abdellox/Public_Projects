import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Play, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AlgorithmCard } from '../components/AlgorithmCard'
import { Button } from '../components/ui/Button'
import { GitHubIcon } from '../components/ui/GitHubIcon'
import { categories } from '../data/categories'
import { getPopularAlgorithms } from '../lib/content'
import { useMemo, useState } from 'react'
import { useVizPlayer } from '../components/viz/useVizPlayer'
import { generateSortSteps } from '../components/viz/sorting/steps'
import type { SortStep } from '../components/viz/sorting/steps'
import { VizControls } from '../components/viz/VizControls'
import { cn } from '../lib/utils'

const COMPLEXITY_GROWTH: Array<{ label: string; values: number[] }> = [
  { label: 'O(1)', values: [1, 1, 1, 1, 1, 1] },
  { label: 'O(log n)', values: [0, 6, 12, 18, 23, 27] },
  { label: 'O(n)', values: [4, 32, 128, 512, 1024, 4096] },
  { label: 'O(n log n)', values: [8, 160, 896, 4608, 10240, 49152] },
  { label: 'O(n²)', values: [16, 1024, 16384, 262144, 1048576, 16777216] },
]

function HeroViz() {
  const steps = useMemo<SortStep[]>(() => generateSortSteps('bubble'), [])
  const player = useVizPlayer(steps)
  const current = player.step as SortStep | undefined
  const max = useMemo(() => Math.max(...steps[0]?.state, 1), [steps])

  return (
    <div className="card overflow-hidden p-5 shadow-xl shadow-indigo-500/5 dark:shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-indigo-500" aria-hidden />
          Live · Bubble Sort
        </span>
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {current?.stats.comparisons ?? 0} comparisons
        </span>
      </div>
      <div className="flex h-36 items-end gap-1.5 px-1">
        {(current?.state ?? steps[0].state).map((value, index) => {
          const isActive = current?.positions.includes(index) ?? false
          const isSorted = current?.sorted.includes(index) ?? false
          return (
            <div key={`${index}-${value}`} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] font-medium tabular-nums text-slate-400">{value}</span>
              <div
                className={cn(
                  'w-full rounded-t',
                  isSorted
                    ? 'bg-emerald-500'
                    : isActive
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-t from-indigo-600 to-cyan-500',
                )}
                style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-4">
        <VizControls player={player} progressLabel="step" />
      </div>
    </div>
  )
}

export function HomePage() {
  const popular = getPopularAlgorithms(6)
  const [complexityN, setComplexityN] = useState(4)

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgba(99,102,241,0.12),transparent)]"
        />
        <div className="container-page grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="chip mb-4">
              <Sparkles className="h-3 w-3 text-indigo-500" aria-hidden />
              A growing, community-driven algorithm atlas
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Understand Algorithms,{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Don't Just Memorize Them.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              AlgoAtlas explains algorithms visually and practically — from the problem
              they solve, to step-by-step execution, to clean implementations in Python
              and JavaScript.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/algorithms">
                <Button size="lg">
                  Explore Algorithms
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <a href="https://github.com/Abdellox/Public_Projects/tree/main/AlgoAtlas" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline">
                  <GitHubIcon className="h-4 w-4" />
                  View on GitHub
                </Button>
              </a>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800">
              {[
                { value: '15+', label: 'Algorithms' },
                { value: '15', label: 'Categories' },
                { value: '4', label: 'Visualizations' },
              ].map((stat) => (
                <div key={stat.label} className="px-4 first:pl-0">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <HeroViz />
          </motion.div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Popular algorithms</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start with the classics — well-explained, fully visual.</p>
          </div>
          <Link
            to="/algorithms"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((alg) => (
            <AlgorithmCard key={alg.slug} algorithm={alg} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-100/50 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="container-page">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Browse by category</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Every algorithm belongs to a family. Pick a family and go deeper.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/algorithms?category=${category.slug}`}
                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <category.icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">{category.name}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {category.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <BarChart3 className="h-6 w-6 text-indigo-500" aria-hidden />
              Complexity, felt
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Slide the input size and watch functions grow. Visit the full explorer for
              the interactive version.
            </p>
          </div>
          <Link
            to="/complexity"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 sm:inline-flex"
          >
            Open explorer
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="card p-6">
          <label className="mb-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Search className="h-4 w-4 text-indigo-500" aria-hidden />
            Problem size <span className="font-mono font-semibold text-slate-900 dark:text-white">n = {complexityN}</span>
            <input
              type="range"
              min={2}
              max={8}
              value={complexityN}
              aria-label="Problem size"
              onChange={(event) => setComplexityN(Number(event.target.value))}
              className="w-40 accent-indigo-500"
            />
          </label>
          <div className="space-y-2">
            {COMPLEXITY_GROWTH.map((row, index) => {
              const base = 10 ** (complexityN - 4)
              const current = row.values[complexityN - 2] * base
              const fraction = Math.min(1, current / 10_000_000)
              return (
                <div key={row.label} className="flex items-center gap-3 text-sm">
                  <span className="w-20 shrink-0 font-mono text-xs font-semibold text-slate-900 dark:text-white">{row.label}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                    <div
                      className={cn(
                        'h-full rounded bg-gradient-to-r transition-[width]',
                        index < 2 ? 'from-emerald-500 to-emerald-400' : index < 4 ? 'from-indigo-500 to-cyan-400' : 'from-rose-500 to-orange-400',
                      )}
                      style={{ width: `${Math.max(2, fraction * 100)}%` }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
                    {current >= 1e6 ? `${(current / 1e6).toFixed(1)}M` : current >= 1e3 ? `${(current / 1e3).toFixed(1)}k` : current}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-100/50 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="container-page flex flex-col items-center gap-4 text-center">
          <span className="chip">
            <Play className="h-3 w-3 text-indigo-500" aria-hidden />
            Contribute
          </span>
          <h2 className="max-w-xl text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Algorithms are infinite. Our atlas doesn't have to be finished to be useful.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Add an explanation, an implementation, or a visualization. Content lives in
            plain markdown files — no app changes required.
          </p>
          <a href="https://github.com/Abdellox/Public_Projects/tree/main/AlgoAtlas" target="_blank" rel="noreferrer">
            <Button>
              <GitHubIcon className="h-4 w-4" />
              Become a contributor
            </Button>
          </a>
        </div>
      </section>
    </>
  )
}