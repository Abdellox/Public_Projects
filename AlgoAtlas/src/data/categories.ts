import {
  Binary,
  Brain,
  Brackets,
  Calculator,
  Cpu,
  GitBranch,
  Hash,
  Layers,
  ListTree,
  Network,
  Shapes,
  Sigma,
  Sparkles,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Category } from '../types/algorithm'

export interface CategoryWithIcon extends Category {
  icon: LucideIcon
}

export const categories: CategoryWithIcon[] = [
  {
    slug: 'sorting',
    name: 'Sorting',
    plural: 'Sorting',
    description: 'Ordering elements by a defined key.',
    icon: ListTree,
  },
  {
    slug: 'searching',
    name: 'Searching',
    plural: 'Searching',
    description: 'Finding an element with a given value or property.',
    icon: Binary,
  },
  {
    slug: 'arrays',
    name: 'Arrays',
    plural: 'Arrays',
    description: 'Techniques for contiguous data sequences.',
    icon: Brackets,
  },
  {
    slug: 'graphs',
    name: 'Graphs',
    plural: 'Graphs',
    description: 'Traversing and analyzing networks of nodes and edges.',
    icon: Network,
  },
  {
    slug: 'dynamic-programming',
    name: 'Dynamic Programming',
    plural: 'Dynamic Programming',
    description: 'Breaking problems into overlapping subproblems.',
    icon: Brain,
  },
  {
    slug: 'trees',
    name: 'Trees',
    plural: 'Trees',
    description: 'Hierarchical data structure algorithms.',
    icon: GitBranch,
  },
  {
    slug: 'greedy',
    name: 'Greedy',
    plural: 'Greedy',
    description: 'Making locally optimal choices at each step.',
    icon: Sparkles,
  },
  {
    slug: 'backtracking',
    name: 'Backtracking',
    plural: 'Backtracking',
    description: 'Trying candidates and undoing dead ends.',
    icon: Workflow,
  },
  {
    slug: 'linked-lists',
    name: 'Linked Lists',
    plural: 'Linked Lists',
    description: 'Sequential data stored in non-contiguous nodes.',
    icon: Layers,
  },
  {
    slug: 'strings',
    name: 'Strings',
    plural: 'Strings',
    description: 'Pattern matching and text processing.',
    icon: Sigma,
  },
  {
    slug: 'heaps',
    name: 'Heaps',
    plural: 'Heaps',
    description: 'Priority-ordered tree structures.',
    icon: Shapes,
  },
  {
    slug: 'hashing',
    name: 'Hashing',
    plural: 'Hashing',
    description: 'Direct-address table lookups.',
    icon: Hash,
  },
  {
    slug: 'math',
    name: 'Math',
    plural: 'Math',
    description: 'Number-theoretic and combinatorial algorithms.',
    icon: Calculator,
  },
  {
    slug: 'stacks-queues',
    name: 'Stacks & Queues',
    plural: 'Stacks & Queues',
    description: 'Restricted-access linear collections.',
    icon: Layers,
  },
  {
    slug: 'divide-conquer',
    name: 'Divide & Conquer',
    plural: 'Divide & Conquer',
    description: 'Split, solve, and combine recursive strategies.',
    icon: Cpu,
  },
]

export const categoryMap: Record<string, CategoryWithIcon> = Object.fromEntries(
  categories.map((category) => [category.slug, category]),
)

export function getCategory(slug: string): CategoryWithIcon | undefined {
  return categoryMap[slug]
}