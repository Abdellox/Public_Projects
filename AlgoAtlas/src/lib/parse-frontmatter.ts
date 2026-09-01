const LIST_ITEM_RE = /^\s*-\s+(.*)$/
const KEY_VALUE_RE = /^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$/
const KEY_ONLY_RE = /^([a-zA-Z][a-zA-Z0-9_-]*):\s*$/

function parseScalar(raw: string): string | boolean | number | string[] | null {
  const value = raw.trim()
  if (value === '') return null
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
  }
  return value.replace(/^['"]|['"]$/g, '')
}

/**
 * Parses a YAML-alike frontmatter block written between `---` lines.
 * Supports scalar values, booleans, numbers, inline arrays and
 * indented dash-lists. Kept intentionally small so content files
 * stay easy to write and review.
 */
export function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const data: Record<string, unknown> = {}
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/)
  const body = lines
    .slice(1) // drop leading `---`
    .join('\n')

  let i = 1
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '---') {
      const rest = lines.slice(i + 1).join('\n')
      return { data, body: rest.trimStart() }
    }

    const listMatch = line.match(KEY_ONLY_RE)
    if (listMatch) {
      const key = listMatch[1]
      const items: string[] = []
      let j = i + 1
      while (j < lines.length) {
        const itemLine = lines[j]
        const itemMatch = itemLine.match(LIST_ITEM_RE)
        if (itemMatch) {
          items.push(parseScalar(itemMatch[1]) as string)
          j += 1
        } else {
          break
        }
      }
      data[key] = items
      i = j
      continue
    }

    const kvMatch = line.match(KEY_VALUE_RE)
    if (kvMatch) {
      data[kvMatch[1]] = parseScalar(kvMatch[2])
      i += 1
      continue
    }

    if (line.trim() === '') {
      i += 1
      continue
    }

    // Any other non-frontmatter syntax: treat the rest as body.
    const rest = lines.slice(i).join('\n')
    return { data, body: rest.trimStart() }
  }

  return { data, body }
}