import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joins truthy string classes', () => {
    expect(cn('a', 'b', false && 'c', null, undefined, '')).toBe('a b')
  })

  it('includes keys of object maps that are true', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })
})
