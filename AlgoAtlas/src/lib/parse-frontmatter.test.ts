import { describe, expect, it } from 'vitest'
import { parseFrontmatter } from './parse-frontmatter'

describe('parseFrontmatter', () => {
  it('parses scalar, boolean, number and array values', () => {
    const raw = `---
title: Bubble Sort
category: sorting
difficulty: beginner
stable: true
n: 5
aka: [Sinking sort]
tags:
  - comparison
  - exchange
---

## Heading

Body text here.
`
    const { data, body } = parseFrontmatter(raw)
    expect(data.title).toBe('Bubble Sort')
    expect(data.category).toBe('sorting')
    expect(data.stable).toBe(true)
    expect(data.n).toBe(5)
    expect(data.aka).toEqual(['Sinking sort'])
    expect(data.tags).toEqual(['comparison', 'exchange'])
    expect(body).toContain('## Heading')
    expect(body).toContain('Body text here.')
  })

  it('handles empty frontmatter gracefully', () => {
    const { data, body } = parseFrontmatter('---\n---\nplain body')
    expect(data).toEqual({})
    expect(body).toBe('plain body')
  })

  it('returns the remaining lines as body when no closing delimiter exists', () => {
    const { body } = parseFrontmatter('---\na: 1\nb: 2')
    expect(body).toContain('a: 1')
  })
})
