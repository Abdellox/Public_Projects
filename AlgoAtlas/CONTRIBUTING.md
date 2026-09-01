# Contributing to AlgoAtlas

Thanks for helping build the atlas! 🗺️ This project is designed so that adding an
algorithm is easy and self-contained — you should not need to modify unrelated parts
of the app.

## How to add an algorithm (content only)

The simplest contribution is an explanation with implementations. No code changes
needed.

1. Decide its **slug** (e.g. `quick-sort`) and **category** (e.g. `sorting`).
2. Create `src/content/<category>/<slug>.md`.
3. Fill in the frontmatter (metadata) and the Markdown body.

The app loads every `.md` file under `src/content/` automatically.

### Frontmatter reference

```text
---
title: Quick Sort              # display name (required)
category: sorting              # one of the category slugs (required)
difficulty: intermediate       # beginner | intermediate | advanced
aka: [Quicksort]               # optional: alternate names
short: One-line description.   # (required)
best: O(n log n)               # optional
average: O(n log n)            # (required)
worst: O(n²)                   # (required)
space: O(log n)                # (required)
stable: false                  # optional boolean
inPlace: true                  # optional boolean
visualizable: false            # true once a visualization exists
related: [merge-sort]          # optional list of other slugs
tags: [divide-and-conquer]     # optional list, used in search
---

## What problem does it solve?
...
```

### Body structure

Aim for a consistent structure. Don't feel you must include every section, but the
more complete, the better:

- `## What problem does it solve?`
- `## How it works`
- `## Step-by-step example`
- `## Pseudocode`
- `## Implementation` — Python and JS/TS fenced code blocks
- `## Complexity` — a small table
- `## When to use it` / `## When NOT to use it`
- `## Common mistakes`
- `## Related algorithms`
- `## Practice problems`

### Add an implementation in another language

Just add another fenced code block to the `## Implementation` section with the
appropriate language tag — `python`, `javascript`, `typescript`, `cpp`, `java`,
`rust`, `go`. The syntax highlighter picks it up automatically.

## Add a visualization

Visualizations are powered by a reusable step engine. If you want to animate an
algorithm:

1. Write a **step generator** that returns a list of steps (each step = a state
   snapshot plus a human-readable description). See the sort generators in
   `src/components/viz/sorting/steps.ts` for the pattern.
2. Build a **renderer** component that draws the current step. See
   `src/components/viz/sorting/SortingVisualizer.tsx`.
3. Register both in `src/components/viz/registry.tsx` under the algorithm slug.
4. Set `visualizable: true` in the algorithm's frontmatter.

Every visualizer automatically gets Start / Pause / Reset / Step Forward / Speed
controls and a progress bar via `useVizPlayer` and `VizControls`.

## Testing

```bash
npm test          # run the test suite once
npm run typecheck # TypeScript type-checking
npm run lint      # oxlint
```

If your change adds logic (e.g. a step generator), please add tests next to it,
e.g. `steps.test.ts`. Verify all tests pass before opening a PR.

## Pull request process

1. Fork the repo and create a branch.
2. Make your changes; keep them focused on one thing.
3. Run `npm test`, `npm run typecheck`, and `npm run lint`.
4. Update the [CHANGELOG.md](CHANGELOG.md) under "Unreleased" if appropriate.
5. Open a pull request and fill in the template.

## Development setup

```bash
npm install
npm run dev
```

## Style notes

- Write clear, accurate prose. This is an educational project — beginners will read it.
- Prefer simple, readable code in examples over clever one-liners.
- Cite complexity precisely; don't hand-wave.
- For practice problems, **link out** to platforms like LeetCode — do **not** paste
  problem statements that may have restrictive licenses.

## Code of conduct

Please read and follow the [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.
