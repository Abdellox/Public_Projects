import { ArrowRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCategory } from '../data/categories'
import type { Algorithm, Difficulty } from '../types/algorithm'
import { cn } from '../lib/utils'
import { DIFFICULTY_LABELS } from '../types/algorithm'
import { DIFFICULTY_TONE_CLASSES } from './ui/DifficultyBadge'
import { Badge } from './ui/Badge'

export function ComplexityPill({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <span className="text-xs text-slate-500 dark:text-slate-400">
      <span className="font-medium">{label}</span>{' '}
      <span className="font-mono font-semibold text-slate-900 dark:text-white">{value}</span>
    </span>
  )
}

export function AlgorithmCard({ algorithm, className }: { algorithm: Algorithm; className?: string }) {
  const { meta } = algorithm
  const category = getCategory(meta.category)

  return (
    <Link
      to={`/algorithms/${algorithm.slug}`}
      className={cn(
        'group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all',
        'hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50',
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', DIFFICULTY_TONE_CLASSES[meta.difficulty as Difficulty])}
        >
          {DIFFICULTY_LABELS[meta.difficulty as Difficulty]}
        </span>
        {meta.visualizable ? (
          <Badge variant="accent">
            <Play className="h-3 w-3" aria-hidden />
            Visualize
          </Badge>
        ) : null}
      </div>

      <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 dark:text-white">
        {category ? <category.icon className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" aria-hidden /> : null}
        {meta.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{meta.short}</p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <ComplexityPill label="Time" value={meta.average} />
          <ComplexityPill label="Space" value={meta.space} />
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" aria-hidden />
      </div>
    </Link>
  )
}