const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
}

function Svg({ children, className = "h-5 w-5", ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} {...props}>
      {children}
    </svg>
  )
}

export const IconBox = (p) => (
  <Svg {...p}>
    <path d="M3.5 8.5 12 4l8.5 4.5v7L12 20l-8.5-4.5v-7Z" />
    <path d="M3.5 8.5 12 13l8.5-4.5M12 13v7" />
  </Svg>
)

export const IconScan = (p) => (
  <Svg {...p}>
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <path d="M7 12h10" />
  </Svg>
)

export const IconBell = (p) => (
  <Svg {...p}>
    <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" />
    <path d="M10.3 19a2 2 0 0 0 3.4 0" />
  </Svg>
)

export const IconArrows = (p) => (
  <Svg {...p}>
    <path d="m17 4 4 4-4 4M21 8H9M7 20l-4-4 4-4M3 16h12" />
  </Svg>
)

export const IconTag = (p) => (
  <Svg {...p}>
    <path d="M12.6 3H6a2 2 0 0 0-2 2v6.6a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8L13 4.6A2 2 0 0 0 12.6 3Z" />
    <circle cx="8.5" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
  </Svg>
)

export const IconChart = (p) => (
  <Svg {...p}>
    <path d="M4 4v15a1 1 0 0 0 1 1h15" />
    <path d="m7.5 14.5 3.5-4 3 2.5 4.5-6" />
  </Svg>
)

export const IconUpload = (p) => (
  <Svg {...p}>
    <path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Svg>
)

export const IconPin = (p) => (
  <Svg {...p}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
)

export const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Svg>
)

export const IconLayers = (p) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Svg>
)

export const IconTruck = (p) => (
  <Svg {...p}>
    <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h9A1.5 1.5 0 0 1 15 6.5V16H3V6.5Z" />
    <path d="M15 9h3.2a2 2 0 0 1 1.7 1l1.6 2.7c.33.55.5 1.18.5 1.82V16h-2" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="16.5" cy="18" r="1.8" />
    <path d="M8.8 18h5.9M3 16v2h1.2" />
  </Svg>
)

export const IconReport = (p) => (
  <Svg {...p}>
    <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path d="M14 3v5h5M9 17v-3m3 3v-5m3 5v-2" />
  </Svg>
)

export const IconGear = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Svg>
)

export const IconCheck = (p) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)

export const IconArrowRight = (p) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M4 12h16m0 0-6-6m6 6-6 6" />
  </Svg>
)

export const IconChevronDown = (p) => (
  <Svg {...p} strokeWidth={2}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

export const IconPlus = (p) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
)

export const IconMenu = (p) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)

export const IconX = (p) => (
  <Svg {...p} strokeWidth={2}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
)

export const IconStar = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
  </svg>
)
