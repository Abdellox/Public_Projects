# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Project scaffold: Vite + React + TypeScript + Tailwind CSS.
- Design system: dark/light mode, responsive layout, badges, buttons, code blocks.
- Content model: frontmatter + Markdown loader for algorithms (`src/lib/content.ts`).
- Homepage with hero, live Bubble Sort visualization, popular algorithms, category
  browsing, and a mini complexity section.
- Algorithms index with client-side search (title/aka/tags/category), category
  filters, and difficulty filters.
- Algorithm detail pages with sidebar navigation, complexity summary, related
  algorithms, and practice links.
- Reusable visualization engine (`useVizPlayer`, `VizControls`) with Start / Pause /
  Reset / Step / Speed controls.
- Sorting visualizations for Bubble, Selection, and Insertion sort.
- Binary search visualization.
- Complexity Explorer (O(1) through O(n!)) with linear/log scales.
- Comparison pages: Binary vs Linear, Merge vs Quick, Bubble vs Quick, Insertion vs
  Selection, Dijkstra vs Bellman-Ford.
- First algorithm set: Bubble, Selection, Insertion, Merge, Quick, Linear Search,
  Binary Search, Dijkstra, Bellman-Ford, Fibonacci DP, 0/1 Knapsack.
- Unit tests (Vitest + Testing Library) for the frontmatter parser, `cn` utility, and
  sort step generators.
- Open-source docs: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, LICENSE, CHANGELOG.

## [0.1.0] - 2026-08-29

Initial foundation release.
