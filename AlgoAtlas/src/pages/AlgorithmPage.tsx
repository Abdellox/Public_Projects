import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlgorithmCard } from '../components/AlgorithmCard'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Markdown } from '../components/ui/Markdown'
import { getVisualizer } from '../components/viz/registry'
import { getCategory } from '../data/categories'
import { getAlgorithm, getRelatedAlgorithms } from '../lib/content'
import { cn } from '../lib/utils'
import type { Difficulty } from '../types/algorithm'
import { DIFFICULTY_TONE_CLASSES } from '../components/ui/DifficultyBadge'
import { DIFFICULTY_LABELS } from '../types/algorithm'

const HEADING_RE = /^##\s+(.+)$/gm

function extractSections(body: string): Array<{ title: string; id: string }> {
  return [...body.matchAll(HEADING_RE)].map((match) => {
    const title = match[1].trim()
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
    return { title, id }
  })
}

function ComplexityCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-900 dark:bg-slate-800 dark:text-white">
        {value}
      </code>
    </div>
  )
}

export function AlgorithmPage() {
  const { slug = '' } = useParams()
  const algorithm = getAlgorithm(slug)

  const sections = useMemo(() => (algorithm ? extractSections(algorithm.body) : []), [algorithm])
  const Visualizer = algorithm?.meta.visualizable ? getVisualizer(algorithm.slug) : undefined

  if (!algorithm) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Algorithm not found</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The algorithm “{slug}” doesn't exist yet — maybe you should write it?</p>
        <Link to="/algorithms" className="mt-6 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">
          ← Back to all algorithms
        </Link>
      </div>
    )
  }

  const category = getCategory(algorithm.meta.category)
  const related = getRelatedAlgorithms(algorithm)
  const { meta } = algorithm

  return (
    <div className="container-page py-10">
      <Breadcrumbs
        crumbs={[
          { label: 'Algorithms', to: '/algorithms' },
          ...(category ? [{ label: category.name, to: `/algorithms?category=${category.slug}` }] : []),
          { label: meta.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
        <article className="min-w-0">
          <header className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', DIFFICULTY_TONE_CLASSES[meta.difficulty as Difficulty])}>
                {DIFFICULTY_LABELS[meta.difficulty as Difficulty]}
              </span>
              {category ? (
                <Link to={`/algorithms?category=${category.slug}`}>
                  <span className="chip cursor-pointer transition-colors hover:border-indigo-300">
                    <category.icon className="h-3 w-3 text-indigo-500" aria-hidden />
                    {category.name}
                  </span>
                </Link>
              ) : null}
              {meta.aka?.length ? (
                <span className="text-xs text-slate-400 dark:text-slate-500">also known as {meta.aka.join(', ')}</span>
              ) : null}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{meta.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">{meta.short}</p>
          </header>

          {Visualizer ? (
            <section aria-label="Interactive visualization" className="mb-10">
              <h2 id="visualization" className="mb-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Interactive visualization
              </h2>
              <Visualizer />
            </section>
          ) : null}

          <Markdown source={algorithm.body} />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <nav aria-label="On this page" className="card p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">On this page</p>
              <ul className="space-y-1.5">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded px-2 py-1 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="card p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Complexity</p>
              {meta.best ? <ComplexityCell label="Best case" value={meta.best} /> : null}
              <ComplexityCell label="Average" value={meta.average} />
              <ComplexityCell label="Worst case" value={meta.worst} />
              <ComplexityCell label="Space" value={meta.space} />
              {typeof meta.stable === 'boolean' ? <ComplexityCell label="Stable" value={meta.stable ? 'Yes' : 'No'} /> : null}
              {typeof meta.inPlace === 'boolean' ? <ComplexityCell label="In place" value={meta.inPlace ? 'Yes' : 'No'} /> : null}
            </div>

            {related.length > 0 ? (
              <div className="card p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Related</p>
                <ul className="space-y-2">
                  {related.map((relatedAlg) => (
                    <li key={relatedAlg.slug}>
                      <Link
                        to={`/algorithms/${relatedAlg.slug}`}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                      >
                        {relatedAlg.meta.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-14 border-t border-slate-200 pt-10 dark:border-slate-800">
          <h2 className="mb-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Continue exploring</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((alg) => (
              <AlgorithmCard key={alg.slug} algorithm={alg} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}