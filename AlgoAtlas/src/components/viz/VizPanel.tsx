import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import type { VizPlayer } from './types'
import { VizControls } from './VizControls'

export function VizPanel({
  player,
  render,
  description,
  className,
}: {
  player: VizPlayer
  render: (step: VizPlayer['step']) => ReactNode
  description?: ReactNode
  className?: string
}) {
  return (
    <div className={`card overflow-hidden ${className ?? ''}`}>
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="min-h-6">
          {description ?? (
            <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Info className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
              {player.step?.description ?? 'Press Start or step through the algorithm.'}
            </p>
          )}
        </div>
      </div>
      <div className="flex min-h-64 items-center justify-center overflow-x-auto bg-white p-4 dark:bg-slate-950/50">
        {render(player.step)}
      </div>
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <VizControls player={player} />
      </div>
    </div>
  )
}