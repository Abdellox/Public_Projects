import { describe, expect, it } from 'vitest'
import { algorithms } from './content'
import { categoryMap } from '../data/categories'
import { generateSortSteps } from '../components/viz/sorting/steps'

describe('algorithm content integrity', () => {
  it('loads at least the core algorithm set', () => {
    const slugs = algorithms.map((alg) => alg.slug)
    const expected = [
      'bubble-sort',
      'selection-sort',
      'insertion-sort',
      'merge-sort',
      'quick-sort',
      'linear-search',
      'binary-search',
      'dijkstra',
      'bellman-ford',
      'fibonacci-dp',
      'knapsack-01',
    ]
    for (const slug of expected) {
      expect(slugs).toContain(slug)
    }
  })

  it('gives every algorithm a valid, known category', () => {
    for (const alg of algorithms) {
      expect(categoryMap[alg.meta.category], `${alg.slug} has unknown category`).toBeDefined()
    }
  })

  it('gives every algorithm valid difficulty, complexity, and a description', () => {
    for (const alg of algorithms) {
      expect(['beginner', 'intermediate', 'advanced']).toContain(alg.meta.difficulty)
      expect(alg.meta.average).toMatch(/^O\(/)
      expect(alg.meta.worst).toMatch(/^O\(/)
      expect(alg.meta.space).toMatch(/^O\(/)
      expect(alg.meta.short.length).toBeGreaterThan(10)
      expect(alg.body.length).toBeGreaterThan(200)
    }
  })

  it('does not reference related algorithms that do not exist yet', () => {
    const known = new Set(algorithms.map((alg) => alg.slug))
    for (const alg of algorithms) {
      for (const slug of alg.meta.related ?? []) {
        expect(known.has(slug), `${alg.slug} references missing related algorithm "${slug}"`).toBe(true)
      }
    }
  })

  it('related links in the body point to existing algorithms', () => {
    const known = new Set(algorithms.map((alg) => alg.slug))
    for (const alg of algorithms) {
      const links = [...alg.body.matchAll(/\/algorithms\/([a-z0-9-]+)/g)].map((m) => m[1])
      for (const slug of links) {
        expect(known.has(slug), `${alg.slug} body links to missing algorithm "${slug}"`).toBe(true)
      }
    }
  })

  it('every visualizable algorithm has a registered visualizer step source', () => {
    for (const alg of algorithms) {
      if (alg.meta.visualizable && ['bubble-sort', 'selection-sort', 'insertion-sort'].includes(alg.slug)) {
        const kind = alg.slug.replace('-sort', '') as 'bubble' | 'selection' | 'insertion'
        expect(() => generateSortSteps(kind)).not.toThrow()
      }
    }
  })
})
