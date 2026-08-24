function smoothPath(points) {
  if (points.length < 2) return ""
  let d = `M ${points[0][0]},${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const cx = (x0 + x1) / 2
    d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`
  }
  return d
}

export function AreaChart({ data, className = "", stroke = "#059669", id = "area" }) {
  const W = 560
  const H = 200
  const PAD = 8
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => [
    PAD + (i * (W - PAD * 2)) / (data.length - 1),
    H - PAD - ((v - min) / range) * (H - PAD * 2),
  ])
  const line = smoothPath(points)
  const fillId = `${id}-fill`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={PAD} x2={W - PAD} y1={H * t} y2={H * t} className="stroke-navy-100" strokeWidth="1" />
      ))}
      <path d={`${line} L ${points[points.length - 1][0]},${H} L ${points[0][0]},${H} Z`} fill={`url(#${fillId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function BarChart({ values, labels, className = "" }) {
  const max = Math.max(...values)
  return (
    <div className={`flex h-full items-end gap-2 ${className}`} aria-hidden="true">
      {values.map((v, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div
            className={`w-full rounded-md transition-all duration-500 ${
              v === max ? "bg-emerald-600" : "bg-emerald-600/25"
            }`}
            style={{ height: `${(v / max) * 100}%` }}
          />
          <span className="text-[10px] font-medium text-navy-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}
