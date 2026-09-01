# AlgoAtlas 🗺️

> **Explore. Visualize. Understand. Algorithms.**

A growing, community-driven atlas of algorithms — explained visually and practically.
Not another repository full of half-commented solutions: every algorithm follows a
consistent structure that takes you from *the problem* to *the code*, with interactive
visualizations where it counts.

---

## What it is

AlgoAtlas is a documentation + interactive visualization platform. Each algorithm page
walks you through:

1. What problem it solves
2. A simple explanation
3. A visual, step-by-step execution
4. Pseudocode
5. Implementations in **Python** and **JavaScript/TypeScript**
6. Time & space complexity
7. When to use it — and when **not** to
8. Common mistakes
9. Related algorithms
10. Practice problems (linked, never copied)

## Highlights

- **Interactive visualizations** — sorting, searching, and more, with Start / Pause /
  Reset / Step controls, speed control, and a running operation counter.
- **Complexity Explorer** — move a slider and watch O(1) through O(n!) grow.
- **Side-by-side comparisons** — Binary vs Linear search, Merge vs Quick sort, and more.
- **Dark / light mode**, responsive layout, keyboard accessible, client-side search with
  category + difficulty filters.

## Tech stack

| Area | Choice |
| ---- | ------ |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Animations | Framer Motion |
| Icons | Lucide React |
| Content | Markdown (frontmatter + body) |
| Testing | Vitest, Testing Library |

No backend and **no AI** — content is authored by humans as plain Markdown files.

## Getting started

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# type-check
npm run typecheck

# lint
npm run lint

# run tests
npm test

# production build
npm run build
```

## Project structure

```text
algoatlas/
├── src/
│   ├── components/        # UI + visualization components
│   │   └── viz/           # reusable visualization engine
│   │       ├── sorting/
│   │       └── searching/
│   ├── content/           # algorithm explanations (Markdown!)
│   │   ├── sorting/
│   │   ├── searching/
│   │   ├── graphs/
│   │   └── dynamic-programming/
│   ├── data/              # categories, presets
│   ├── lib/               # content loader, theme, utils
│   ├── pages/             # route components
│   └── types/             # shared types
├── public/
├── index.html
└── package.json
```

### Adding an algorithm

The whole point is that adding an algorithm should not require touching app code.
Drop a Markdown file into `src/content/<category>/<slug>.md`:

```text
---
title: My Algorithm
category: sorting
difficulty: intermediate
short: One-line description.
best: O(n)
average: O(n²)
worst: O(n²)
space: O(1)
related: [bubble-sort]
---

## What problem does it solve?
...
```

The app picks it up automatically. Want a visualization too? Add a step generator under
`src/components/viz/` and register it in `src/components/viz/registry.tsx`. Full guide:
[CONTRIBUTING.md](CONTRIBUTING.md).

## Roadmap

- [x] Project setup + design system
- [x] Homepage, categories, search, filters
- [x] First ~10 algorithm pages
- [x] Visualization engine (sorting + binary search)
- [x] Complexity Explorer + comparison pages
- [ ] Expand algorithm library (20–30+) and visualizations
- [ ] BFS/DFS/Dijkstra graph visualizations
- [ ] More languages: C++, Java, Go, Rust

## Automated checks (CI)

Every push and pull request that touches this folder runs lint, type-check, tests,
and a production build on GitHub Actions. The workflow (`ci.yml`) is registered at
the **repository root** under `.github/workflows/` and is scoped to the `AlgoAtlas/`
folder, so it never affects other projects in the repo. When running locally:

```bash
npm run lint        # oxlint
npm run typecheck   # TypeScript
npm test            # Vitest
npm run build       # production build
```

## Contributing

Contributions are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). All
participants are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Distributed under the [MIT License](LICENSE).
