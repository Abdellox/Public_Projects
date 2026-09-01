import type { Difficulty } from '../../types/algorithm'
import { DIFFICULTY_LABELS } from '../../types/algorithm'
import { Badge } from './Badge'

type Tone = 'success' | 'warning' | 'info'

const DIFFICULTY_TONES: Record<Difficulty, Tone> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'info',
}

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return (
    <Badge variant={DIFFICULTY_TONES[difficulty]} className={className}>
      {DIFFICULTY_LABELS[difficulty]}
    </Badge>
  )
}

export const DIFFICULTY_TONE_CLASSES: Record<Difficulty, string> = {
  beginner:
    'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  intermediate:
    'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30',
  advanced:
    'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30',
}