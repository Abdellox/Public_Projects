import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const items: Crumb[] = [{ label: 'Home', to: '/' }, ...crumbs]
  return (
    <nav aria-label="Breadcrumb" className="pb-2">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        {items.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden /> : null}
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="inline-flex items-center gap-1 transition-colors hover:text-slate-900 dark:hover:text-white"
              >
                {index === 0 ? <Home className="h-3.5 w-3.5" aria-hidden /> : null}
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-slate-900 dark:text-white">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}