import { Link } from 'react-router-dom'
import { GitHubIcon } from '../ui/GitHubIcon'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
          <span className="font-semibold text-slate-900 dark:text-white">AlgoAtlas</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            A growing, community-driven atlas of algorithms, explained visually and practically.
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/algorithms" className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            Algorithms
          </Link>
          <a
            href="https://github.com/Abdellox/Public_Projects/tree/main/AlgoAtlas"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}