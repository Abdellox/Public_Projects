import { useMemo } from 'react'
import { useVizPlayer } from '../useVizPlayer'
import { VizPanel } from '../VizPanel'
import type { SortStep } from './steps'
import { cn } from '../../../lib/utils'

type BarState = 'default' | 'active' | 'swap' | 'sorted'

function Bar({ value, max, state }: { value: number; max: number; state: BarState }) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={String(value)}>
      <span className="text-[10px] font-medium tabular-nums text-slate-500 dark:text-slate-400">{value}</span>
      <div
        className={cn('w-full rounded-t transition-colors duration-150', {
          'bg-gradient-to-t from-indigo-600 to-cyan-500': state === 'default',
          'bg-amber-400 dark:bg-amber-400': state === 'active',
          'bg-rose-500': state === 'swap',
          'bg-emerald-500': state === 'sorted',
        })}
        style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
      />
    </div>
  )
}

export function SortingVisualizer({ steps }: { steps: SortStep[] }) {
  const player = useVizPlayer(steps)
  const max = useMemo(() => Math.max(...steps[0]?.state, 1), [steps])

  return (
    <VizPanel
      player={player}
      render={(step) => {
        const current = step as SortStep | undefined
        if (!current) return null
        return (
          <div className="flex h-52 w-full min-w-72 max-w-xl gap-1.5">
            {current.state.map((value, index) => {
              let state: BarState = 'default'
              if (current.positions.includes(index)) state = current.kind === 'swap' ? 'swap' : 'active'
              if (current.sorted.includes(index)) state = 'sorted'
              return <Bar key={`${index}-${value}`} value={value} max={max} state={state} />
            })}
          </div>
        )
      }}
      description={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            {player.step?.description ?? 'Press Start to run the visualization.'}
          </p>
          <div className="flex shrink-0 gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Comparisons{' '}
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{(player.step as SortStep | undefined)?.stats.comparisons ?? 0}</span>
            </span>
            <span>
              Swaps <span className="font-mono font-semibold text-slate-900 dark:text-white">{(player.step as SortStep | undefined)?.stats.swaps ?? 0}</span>
            </span>
          </div>
        </div>
      }
    />
  )
}