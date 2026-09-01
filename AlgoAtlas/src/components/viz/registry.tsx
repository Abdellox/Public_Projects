import type { ComponentType } from 'react'
import { generateSortSteps } from './sorting/steps'
import { SortingVisualizer } from './sorting/SortingVisualizer'
import { BinarySearchVisualizer } from './searching/BinarySearchVisualizer'
import type { SortStep } from './sorting/steps'

function BubbleSortViz() {
  return <SortingVisualizer steps={generateSortSteps('bubble') as SortStep[]} />
}
function SelectionSortViz() {
  return <SortingVisualizer steps={generateSortSteps('selection') as SortStep[]} />
}
function InsertionSortViz() {
  return <SortingVisualizer steps={generateSortSteps('insertion') as SortStep[]} />
}
function BinarySearchViz() {
  return <BinarySearchVisualizer />
}

export const visualizers: Record<string, ComponentType> = {
  'bubble-sort': BubbleSortViz,
  'selection-sort': SelectionSortViz,
  'insertion-sort': InsertionSortViz,
  'binary-search': BinarySearchViz,
}

export function getVisualizer(slug: string): ComponentType | undefined {
  return visualizers[slug]
}

export function isVisualizable(slug: string): boolean {
  return Boolean(visualizers[slug])
}