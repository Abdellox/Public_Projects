import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { CodeBlock } from './CodeBlock'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

function extractCode(source: string, _language?: string): string {
  // ReactMarkdown trims trailing newlines from code children; re-add one
  // so the rendered block keeps its final newline.
  return source.endsWith('\n') ? source : `${source}\n`
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-([\w-]+)/.exec(className ?? '')
    const language = match?.[1]
    const code = extractCode(String(children))
    if (language) {
      return <CodeBlock code={code} language={language} />
    }
    // Inline code
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  h2({ children, ...props }) {
    const idContent = Array.isArray(children) ? children.join('') : String(children ?? '')
    return (
      <h2 id={slugify(idContent)} {...props}>
        {children}
      </h2>
    )
  },
}

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose-algo">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  )
}