import type { VizStep } from '../types'

export interface SortStep extends VizStep {
  kind: 'compare' | 'swap' | 'mark' | 'done'
  state: number[]
  positions: number[]
  sorted: number[]
  stats: { comparisons: number; swaps: number }
}

type SortKind = 'bubble' | 'selection' | 'insertion'

function snapshot(
  kind: SortStep['kind'],
  state: number[],
  positions: number[],
  sorted: number[],
  stats: { comparisons: number; swaps: number },
  description: string,
): SortStep {
  return {
    kind,
    state: [...state],
    positions,
    sorted: [...sorted],
    stats: { ...stats },
    description,
  }
}

const SHUFFLED: Record<SortKind, number[]> = {
  bubble: [64, 25, 12, 22, 11, 90, 38, 47],
  selection: [64, 25, 12, 22, 11, 90, 38, 47],
  insertion: [64, 25, 12, 22, 11, 90, 38, 47],
}

export function generateBubbleSteps(): SortStep[] {
  const a = [...SHUFFLED.bubble]
  const steps: SortStep[] = []
  const sorted: number[] = []
  let comparisons = 0
  let swaps = 0

  steps.push(
    snapshot('compare', a, [0, 0], sorted, { comparisons, swaps }, 'Start. Repeatedly swap adjacent out-of-order pairs.'),
  )

  const n = a.length
  for (let pass = 0; pass < n - 1; pass++) {
    let swappedInPass = false
    for (let j = 0; j < n - 1 - pass; j++) {
      comparisons += 1
      steps.push(
        snapshot('compare', a, [j, j + 1], sorted, { comparisons, swaps }, `Compare ${a[j]} and ${a[j + 1]}.`),
      )
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        swaps += 1
        swappedInPass = true
        steps.push(
          snapshot('swap', a, [j, j + 1], sorted, { comparisons, swaps }, `Out of order — swap ${a[j]} and ${a[j + 1]}.`),
        )
      }
    }
    const index = n - 1 - pass
    sorted.push(index)
    steps.push(
      snapshot('mark', a, [index], sorted, { comparisons, swaps }, `${a[index]} bubbled to its final position.`),
    )
    if (!swappedInPass) break
  }
  sorted.push(0)
  steps.push(
    snapshot('done', a, [], sorted, { comparisons, swaps }, `Done! Array sorted in ${comparisons} comparisons and ${swaps} swaps.`),
  )
  return steps
}

export function generateSelectionSteps(): SortStep[] {
  const a = [...SHUFFLED.selection]
  const steps: SortStep[] = []
  const sorted: number[] = []
  let comparisons = 0
  let swaps = 0

  steps.push(
    snapshot('compare', a, [0, 0], sorted, { comparisons, swaps }, 'Start. Repeatedly find the minimum and place it at the front.'),
  )

  for (let i = 0; i < a.length - 1; i++) {
    let minIndex = i
    for (let j = i + 1; j < a.length; j++) {
      comparisons += 1
      steps.push(
        snapshot('compare', a, [minIndex, j], sorted, { comparisons, swaps }, `Is ${a[j]} < ${a[minIndex]}?`),
      )
      if (a[j] < a[minIndex]) {
        minIndex = j
        steps.push(
          snapshot('mark', a, [minIndex], sorted, { comparisons, swaps }, `${a[minIndex]} is the new minimum candidate.`),
        )
      }
    }
    if (minIndex !== i) {
      ;[a[i], a[minIndex]] = [a[minIndex], a[i]]
      swaps += 1
    }
    sorted.push(i)
    steps.push(
      snapshot('mark', a, [i], sorted, { comparisons, swaps }, `Minimum ${a[i]} placed at position ${i} — now sorted.`),
    )
  }
  sorted.push(a.length - 1)
  steps.push(
    snapshot('done', a, [], sorted, { comparisons, swaps }, `Done! Array sorted in ${comparisons} comparisons and ${swaps} swaps.`),
  )
  return steps
}

export function generateInsertionSteps(): SortStep[] {
  const a = [...SHUFFLED.insertion]
  const steps: SortStep[] = []
  const sorted: number[] = [0]
  let comparisons = 0
  let swaps = 0

  steps.push(
    snapshot('compare', a, [0], sorted, { comparisons, swaps }, 'Start. Build the sorted prefix one element at a time.'),
  )

  for (let i = 1; i < a.length; i++) {
    const key = a[i]
    let j = i - 1
    steps.push(
      snapshot('compare', a, [i], sorted, { comparisons, swaps }, `Pick up ${key} and find its home in the sorted prefix.`),
    )
    while (j >= 0 && a[j] > key) {
      comparisons += 1
      steps.push(
        snapshot('compare', a, [j, j + 1], sorted, { comparisons, swaps }, `${a[j]} > ${key} — shift ${a[j]} right.`),
      )
      a[j + 1] = a[j]
      swaps += 1
      steps.push(
        snapshot('swap', a, [j, j + 1], sorted, { comparisons, swaps }, `Shift ${a[j + 1]} right to make room.`),
      )
      j -= 1
    }
    comparisons += 1
    steps.push(
      snapshot('compare', a, [j + 1], sorted, { comparisons, swaps }, `Found the spot — insert ${key} at index ${j + 1}.`),
    )
    a[j + 1] = key
    steps.push(snapshot('swap', a, [j + 1], sorted, { comparisons, swaps }, `Insert ${key}.`))
    const next = ([] as number[]).concat(sorted, [i])
    sorted.length = 0
    sorted.push(...next.sort((x, y) => x - y))
  }
  steps.push(
    snapshot('done', a, [], sorted, { comparisons, swaps }, `Done! Array sorted in ${comparisons} comparisons and ${swaps} swaps.`),
  )
  return steps
}

export type { SortKind }

export function generateSortSteps(kind: SortKind): SortStep[] {
  switch (kind) {
    case 'bubble':
      return generateBubbleSteps()
    case 'selection':
      return generateSelectionSteps()
    case 'insertion':
      return generateInsertionSteps()
  }
}

export const SORT_PRESETS = {
  bubble: { title: 'Bubble Sort', steps: generateBubbleSteps },
  selection: { title: 'Selection Sort', steps: generateSelectionSteps },
  insertion: { title: 'Insertion Sort', steps: generateInsertionSteps },
} as const