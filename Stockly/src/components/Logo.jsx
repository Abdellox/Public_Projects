export default function Logo({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-emerald-600" />
      <path
        d="M9 20.5V13l7-4 7 4v7.5l-7 4-7-4z"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M9 13l7 4 7-4M16 17v7.5"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
