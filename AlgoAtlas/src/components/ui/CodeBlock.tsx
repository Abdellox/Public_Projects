import hljs from 'highlight.js/lib/common'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  cpp: 'C++',
  java: 'Java',
  rust: 'Rust',
  go: 'Go',
  bash: 'Shell',
}

function normalizeLanguage(language?: string): { language: string; label: string } {
  const lang = (language ?? '').toLowerCase()
  const resolved = hljs.getLanguage(lang) ? lang : 'plaintext'
  return { language: resolved, label: LANGUAGE_LABELS[lang] ?? lang }
}

export function CodeBlock({ code, language, className }: { code: string; language?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const { language: resolved, label } = normalizeLanguage(language)

  const html = hljs.highlight(code, { language: resolved }).value

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard unavailable (e.g. non-secure context); ignore.
    }
  }

  return (
    <div className={cn('group/code relative my-4', className)}>
      <div className="flex items-center justify-between rounded-t-xl border-b border-slate-800 bg-slate-900 px-4 py-2">
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
          {label || 'Code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-b-xl border border-t-0 border-slate-800 bg-slate-950 text-sm text-slate-100 shadow-inner">
        <code className={cn('block min-w-max px-4 py-4 font-mono text-[0.85rem] leading-6', className)} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}