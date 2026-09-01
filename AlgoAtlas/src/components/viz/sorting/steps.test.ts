import { describe, expect, it } from 'vitest'
import {
  generateBubbleSteps,
  generateInsertionSteps,
  generateSelectionSteps,
  type SortStep,
} from './steps'

function finalState(steps: SortStep[]): number[] {
  const last = steps[steps.length - 1]
  return [...last.state].sort((a, b) => a - b)
}

function isSorted(steps: SortStep[]): boolean {
  const last = steps[steps.length - 1]
  return last.state.every((value, i) => i === 0 || last.state[i - 1] <= value)
}

const GENERATORS: Record<string, () => SortStep[]> = {
  bubble: generateBubbleSteps,
  selection: generateSelectionSteps,
  insertion: generateInsertionSteps,
}

describe('sort visualization step generators', () => {
  it.each(['bubble', 'selection', 'insertion'])('%s produces a sorted final array and preserves the multiset', (name) => {
    const generate = GENERATORS[name]
    expect(generate).toBeTypeOf('function')
    const steps = generate()
    expect(isSorted(steps)).toBe(true)
    const last = steps[steps.length - 1]
    expect([...last.state].sort((a, b) => a - b)).toEqual(finalState(steps))
  })

  it('each step carries a description and non-negative stats', () => {
    const steps = generateBubbleSteps()
    expect(steps.length).toBeGreaterThan(2)
    for (const step of steps) {
      expect(typeof step.description).toBe('string')
      expect(step.stats.comparisons).toBeGreaterThanOrEqual(0)
      expect(step.stats.swaps).toBeGreaterThanOrEqual(0)
    }
  })

  it('the preset performs at least one swap', () => {
    const steps = generateBubbleSteps()
    const swaps = steps[steps.length - 1].stats.swaps
    expect(swaps).toBeGreaterThan(0)
    expect(swaps).toBeLessThan(steps[0].state.length ** 2)
  })
})
