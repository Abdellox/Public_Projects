import type { VizStep } from '../types'
import { useVizPlayer } from '../useVizPlayer'
import { VizPanel } from '../VizPanel'
import { cn } from '../../../lib/utils'
import { useMemo } from 'react'

export interface BinarySearchStep extends VizStep {
  kind: 'range' | 'check' | 'found' | 'notfound'
  array: number[]
  low: number
  high: number
  mid: number
  target: number
  stats: { comparisons: number }
}

const PRESETS: Array<{ array: number[]; target: number }> = [
  { array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72], target: 23 },
  { array: [3, 7, 9, 11, 14, 19, 22, 27, 31], target: 7 },
  { array: [1, 4, 6, 10, 15, 21, 30, 42], target: 99 },
]

function generateBinarySearchSteps(array: number[], target: number): BinarySearchStep[] {
  const steps: BinarySearchStep[] = []
  let low = 0
  let high = array.length - 1
  let comparisons = 0

  const next = (kind: BinarySearchStep['kind'], mid: number): BinarySearchStep => ({
    kind,
    array: [...array],
    low,
    high,
    mid,
    target,
    stats: { comparisons },
    description: '',
  })

  steps.push({
    ...next('range', -1),
    description: `Find ${target} in a sorted array. Search range is the whole array [0 .. ${high}].`,
  })

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    steps.push({
      ...next('check', mid),
      description: `Middle element is ${array[mid]} at index ${mid}.`,
    })
    comparisons += 1
    if (array[mid] === target) {
      steps.push({
        ...next('found', mid),
        description: `${array[mid]} equals ${target}. Found at index ${mid}!`,
      })
      return steps
    }
    if (array[mid] < target) {
      steps.push({
        ...next('range', mid),
        description: `${array[mid]} < ${target} — discard the left half. Range becomes [${mid + 1} .. ${high}].`,
      })
      low = mid + 1
    } else {
      steps.push({
        ...next('range', mid),
        description: `${array[mid]} > ${target} — discard the right half. Range becomes [${low} .. ${mid - 1}].`,
      })
      high = mid - 1
    }
  }

  steps.push({
    ...next('notfound', -1),
    description: `Range is empty — ${target} is not present. ${comparisons} comparisons were made.`,
  })
  return steps
}

type CellState = 'range' | 'active' | 'found' | 'idle'

function Cell({ value, state, label }: { value: number; state: CellState; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors sm:h-14 sm:w-14 sm:text-base',
          {
            'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-indigo-300': state === 'range',
            'border-amber-400 bg-amber-400 text-slate-900': state === 'active',
            'border-emerald-500 bg-emerald-500 text-white': state === 'found',
            'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500': state === 'idle',
          },
        )}
      >
        {value}
      </div>
      {label ? <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{label}</span> : null}
    </div>
  )
}

export function BinarySearchVisualizer({ variant = 0 }: { variant?: number }) {
  const preset = PRESETS[variant % PRESETS.length]
  const steps = useMemo(() => generateBinarySearchSteps(preset.array, preset.target), [preset])
  const player = useVizPlayer(steps)

  return (
    <VizPanel
      player={player}
      render={(step) => {
        const current = step as BinarySearchStep | undefined
        if (!current) return null
        return (
          <div className="flex max-w-full flex-wrap items-end justify-center gap-2">
            {current.array.map((value, index) => {
              let state: CellState = 'idle'
              let label: string | undefined
              if (index >= current.low && index <= current.high) state = 'range'
              if (index === current.mid) {
                state = current.kind === 'found' ? 'found' : 'active'
                label = current.kind === 'found' ? 'found' : 'mid'
              }
              if (current.kind === 'found' && index === current.mid) label = 'found'
              return <Cell key={`${index}-${value}`} value={value} state={state} label={label} />
            })}
          </div>
        )
      }}
      description={
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 text-sm font-semibold text-slate-900 dark:text-white">
            Target: <span className="text-indigo-600 dark:text-indigo-400">{preset.target}</span> ·{' '}
            {player.step?.description ?? 'Press Start.'}
          </p>
          <div className="flex shrink-0 gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Range{' '}
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                [{(player.step as BinarySearchStep | undefined)?.low ?? 0}..{(player.step as BinarySearchStep | undefined)?.high ?? 0}]
              </span>
            </span>
            <span>
              Comparisons{' '}
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {(player.step as BinarySearchStep | undefined)?.stats.comparisons ?? 0}
              </span>
            </span>
          </div>
        </div>
      }
    />
  )
}