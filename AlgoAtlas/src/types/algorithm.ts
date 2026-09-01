export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Complexity {
  best?: string
  average: string
  worst: string
}

export interface AlgorithmMeta {
  title: string
  category: string
  difficulty: Difficulty
  aka?: string[]
  short: string
  best?: string
  average: string
  worst: string
  space: string
  stable?: boolean
  inPlace?: boolean
  visualizable?: boolean
  related?: string[]
  tags?: string[]
}

export interface Algorithm {
  slug: string
  meta: AlgorithmMeta
  body: string
}

export interface Category {
  slug: string
  name: string
  description: string
  plural: string
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}