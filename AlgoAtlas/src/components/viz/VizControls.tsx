import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import type { VizPlayer } from './types'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

export function VizControls({
  player,
  progressLabel,
  className,
}: {
  player: VizPlayer
  progressLabel?: string
  className?: string
}) {
  const progress = player.total === 0 ? 0 : (player.index + 1) / player.total

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={player.toggle} disabled={player.total === 0} aria-label={player.playing ? 'Pause' : 'Play'}>
          {player.playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
          {player.playing ? 'Pause' : 'Start'}
        </Button>
        <Button variant="outline" size="sm" onClick={player.reset} disabled={player.atStart} aria-label="Reset">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset
        </Button>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={player.stepBack} disabled={player.atStart} aria-label="Step back">
            <SkipBack className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button variant="ghost" size="sm" onClick={player.stepForward} disabled={player.atEnd} aria-label="Step forward">
            <SkipForward className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-1 items-center gap-2">
          <span className="w-24 shrink-0">{progressLabel ?? `${player.index + 1} / ${player.total}`}</span>
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={player.total}
            aria-valuenow={player.index + 1}
            aria-label="Visualization progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-[width] duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        <label className="flex items-center gap-2" htmlFor="viz-speed">
          <span className="hidden sm:inline">Speed</span>
          <input
            id="viz-speed"
            type="range"
            min={1}
            max={10}
            step={1}
            value={player.speed}
            onChange={(event) => player.setSpeed(Number(event.target.value))}
            className="w-24 accent-indigo-500"
          />
          <span className="w-6 font-mono">{player.speed}×</span>
        </label>
      </div>
    </div>
  )
}