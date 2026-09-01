import { useMemo, useState } from 'react'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { cn } from '../lib/utils'

type Scale = 'linear' | 'log'

interface GrowthFunction {
  id: string
  label: string
  color: string
  fn: (n: number) => number
}

const FUNCTIONS: GrowthFunction[] = [
  { id: 'constant', label: 'O(1)', color: '#10b981', fn: () => 1 },
  { id: 'log', label: 'O(log n)', color: '#14b8a6', fn: (n) => Math.log2(Math.max(2, n)) },
  { id: 'linear', label: 'O(n)', color: '#22d3ee', fn: (n) => n },
  { id: 'nlogn', label: 'O(n log n)', color: '#6366f1', fn: (n) => n * Math.log2(Math.max(2, n)) },
  { id: 'quadratic', label: 'O(n²)', color: '#a855f7', fn: (n) => n * n },
  { id: 'exponential', label: 'O(2ⁿ)', color: '#f97316', fn: (n) => Math.pow(2, n) },
  { id: 'factorial', label: 'O(n!)', color: '#ef4444', fn: (n) => factorial(n) },
]

function factorial(n: number): number {
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

const MAX_N = 25
const WIDTH = 720
const HEIGHT = 420
const PADDING = { top: 20, right: 20, bottom: 40, left: 60 }

function formatNumber(value: number): string {
  if (value < 1e3) return String(Math.round(value))
  if (value < 1e6) return `${(value / 1e3).toFixed(1)}k`
  if (value < 1e9) return `${(value / 1e6).toFixed(1)}M`
  return `${(value / 1e9).toFixed(1)}B`
}

export function ComplexityExplorerPage() {
  const [n, setN] = useState(10)
  const [scale, setScale] = useState<Scale>('linear')
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    constant: true,
    log: true,
    linear: true,
    nlogn: true,
    quadratic: true,
    exponential: true,
    factorial: true,
  })

  const { points, innerWidth, innerHeight, xScale, yScale, ticks, yTicks, xPos, yPos } = useMemo(() => {
    const innerWidth = WIDTH - PADDING.left - PADDING.right
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom

    const allValues = FUNCTIONS.flatMap((f) => (enabled[f.id] ? Array.from({ length: MAX_N + 1 }, (_, i) => f.fn(i)) : []))
    const dataMax = Math.max(1, ...allValues)

    const xScaleLinear = (i: number) => PADDING.left + (i / MAX_N) * innerWidth
    const yScaleLinear = (value: number) => PADDING.top + innerHeight - (Math.log10(Math.max(1, value)) / Math.log10(dataMax)) * innerHeight

    const xScaleLog = (i: number) => PADDING.left + (Math.log2(i + 1) / Math.log2(MAX_N + 1)) * innerWidth
    const yScaleLog = (value: number) => PADDING.top + innerHeight - ((Math.log10(Math.max(1, value)) + 3) / (Math.log10(dataMax) + 3)) * innerHeight

    const usedX = scale === 'log' ? xScaleLog : xScaleLinear
    const usedY = scale === 'log' ? yScaleLog : yScaleLinear

    const points = FUNCTIONS.map((f) => ({ ...f, data: Array.from({ length: MAX_N + 1 }, (_, i) => usedY(f.fn(i))) }))

    const tickValues = [0, 1, 2.5, 5, 7.5, 10, 12.5, 15, 20, 25]
    const ticks = tickValues.map((t) => ({ t, x: usedX(t) }))
    const yTicks = [1e0, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18].filter((v) => v < Math.max(1, dataMax))

    const xPos = usedX(n)
    const yPos = FUNCTIONS.filter((f) => enabled[f.id]).map((f) => ({ f, y: usedY(f.fn(n)) }))

    return { points, innerWidth, innerHeight, xScale: (i: number) => usedX(i), yScale: (v: number) => usedY(v), ticks, yTicks, xPos, yPos }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, scale, enabled])

  const linePath = (data: number[]) =>
    data.map((y, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <div className="container-page py-10">
      <Breadcrumbs crumbs={[{ label: 'Complexity Explorer' }]} />
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Complexity Explorer</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Big-O describes how an algorithm's cost grows with input size n. Drag the slider and compare growth
          rates — feel the difference between “fast enough” and “hopeless”.
        </p>
      </div>

      <div className="card p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            Input size
            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm font-semibold text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
              n = {n}
            </span>
            <input
              type="range"
              min={1}
              max={MAX_N}
              value={n}
              aria-label="Input size"
              onChange={(event) => setN(Number(event.target.value))}
              className="w-48 accent-indigo-500"
            />
          </label>
          <div className="flex overflow-hidden rounded-lg border border-slate-200 text-sm dark:border-slate-700" role="group" aria-label="Y-axis scale">
            <button
              type="button"
              onClick={() => setScale('linear')}
              className={cn(
                'px-3 py-1.5 font-medium transition-colors',
                scale === 'linear' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              Linear
            </button>
            <button
              type="button"
              onClick={() => setScale('log')}
              className={cn(
                'border-l border-slate-200 px-3 py-1.5 font-medium transition-colors dark:border-slate-700',
                scale === 'log' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              Log
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full min-w-[560px]" role="img" aria-label="Big-O growth chart">
            <defs>
              <clipPath id="plot-clip">
                <rect x={PADDING.left} y={PADDING.top} width={innerWidth} height={innerHeight} />
              </clipPath>
            </defs>

            {ticks.map((tick) => (
              <g key={tick.t}>
                <line
                  x1={tick.x}
                  x2={tick.x}
                  y1={PADDING.top}
                  y2={PADDING.top + innerHeight}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <text x={tick.x} y={PADDING.top + innerHeight + 20} textAnchor="middle" className="fill-slate-400 text-[11px] font-mono">
                  {tick.t}
                </text>
              </g>
            ))}

            {yTicks.map((value) => (
              <g key={value}>
                <line
                  x1={PADDING.left}
                  x2={PADDING.left + innerWidth}
                  y1={yScale(value)}
                  y2={yScale(value)}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <text x={PADDING.left - 8} y={yScale(value) + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-mono">
                  {formatNumber(value)}
                </text>
              </g>
            ))}
            <text x={PADDING.left} y={PADDING.top + innerHeight + 34} className="fill-slate-400 text-[11px]">
              n →
            </text>

            <g clipPath="url(#plot-clip)">
              {points
                .filter((p) => enabled[p.id])
                .map((p) => (
                  <path key={p.id} d={linePath(p.data)} fill="none" stroke={p.color} strokeWidth={2} opacity={0.9} />
                ))}

              <line
                x1={xPos}
                x2={xPos}
                y1={PADDING.top}
                y2={PADDING.top + innerHeight}
                className="stroke-slate-400 dark:stroke-slate-500"
                strokeWidth={1.5}
              />

              {yPos.map(({ f, y }) => (
                <g key={f.id} transform={`translate(${xPos},${y})`}>
                  <circle r={3.5} fill={f.color} stroke="white" strokeWidth={1.5} />
                  <text x={-8} y={-7} textAnchor="end" className="text-[10px] font-semibold" style={{ fill: f.color }}>
                    {f.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FUNCTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setEnabled((prev) => ({ ...prev, [f.id]: !prev[f.id] }))}
              aria-pressed={enabled[f.id]}
              className={cn(
                'chip cursor-pointer transition-opacity',
                !enabled[f.id] && 'opacity-40',
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} aria-hidden />
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th className="px-2 py-2">Growth</th>
                <th className="px-2 py-2">Operations at n = 10</th>
                <th className="px-2 py-2">Operations at n = 100</th>
                <th className="px-2 py-2">Operations at n = 1,000</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {FUNCTIONS.filter((f) => enabled[f.id]).map((f) => (
                <tr key={f.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="px-2 py-2 text-slate-900 dark:text-white">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
                    {f.label}
                  </td>
                  <td className="px-2 py-2 text-slate-600 dark:text-slate-300">{formatNumber(f.fn(10))}</td>
                  <td className="px-2 py-2 text-slate-600 dark:text-slate-300">{formatNumber(f.fn(100))}</td>
                  <td className="px-2 py-2 text-slate-600 dark:text-slate-300">{formatNumber(f.fn(1000))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}