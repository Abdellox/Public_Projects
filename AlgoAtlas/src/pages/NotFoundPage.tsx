import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { SearchX } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <SearchX className="h-12 w-12 text-slate-300 dark:text-slate-600" aria-hidden />
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">404 — lost in the atlas</h1>
      <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist. Try the index, or contribute the algorithm you were hoping to find.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}