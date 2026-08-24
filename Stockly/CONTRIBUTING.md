# Contributing to Stockly

Thanks for your interest in improving Stockly — an inventory platform that small businesses can actually understand. Every kind of contribution helps: code, design, copy, docs, bug reports, and ideas.

> This project lives in the [Public_Projects](https://github.com/Abdellox/Public_Projects) monorepo. When opening an issue, use the repository issue templates and prefix your title with **[Stockly]**. Keep pull requests inside the `Stockly/` folder.

## Ways to contribute

1. **Report bugs** — use the *Stockly bug report* issue template.
2. **Suggest features** — use the *Stockly feature request* issue template.
3. **Improve docs or copy** — typos, clarity, better explanations: PRs welcome.
4. **Build something from the roadmap** — see the list in the [README](README.md#roadmap).

## Development setup

```bash
git clone <your-fork>
cd Stockly
npm install
npm run dev      # http://localhost:5173
```

- Node.js 18+ required.
- `npm run build` must pass before you open a PR — CI-friendliness starts with you. 🙂

## Project layout

```
src/
├── index.css          # Tailwind v4 @theme tokens — single source of truth for colors/animations
├── App.jsx            # section composition order lives here
└── components/
    ├── Charts.jsx     # dependency-free SVG AreaChart / BarChart
    ├── Reveal.jsx     # IntersectionObserver scroll-reveal wrapper
    ├── icons.jsx      # shared inline stroke icons (add new ones here)
    └── ...sections    # one file per landing-page section
```

Ground rules that keep this codebase simple:

- **No new runtime dependencies** unless absolutely necessary — especially no chart/UI libraries. The whole point of Stockly's front end is that it stays light.
- **Use design tokens**, not raw hex values: `navy-*` for text/surfaces, `emerald-*` for accents. Define new tokens in `src/index.css`.
- **One section = one component file.** Shared primitives (`Reveal`, `SectionHeading`, icons) are reused, not duplicated.
- **Accessibility is not optional:** semantic HTML, labeled controls, visible focus states, contrast-checked colors, and respect for `prefers-reduced-motion`.
- **Mobile-first:** style for small screens first, then layer on `sm:`/`md:`/`lg:` utilities.

## Pull request process

1. Fork → create a branch (`feat/barcode-demo`, `fix/mobile-nav-offset`).
2. Make your change inside the `Stockly/` folder only.
3. Run `npm run build` and click through your change on desktop **and** mobile widths.
4. Open a PR against `main`. The repository PR template will ask you to describe the change — keep the `[Stockly]` prefix in the title.
5. Link the issue your PR closes (`Closes #123`) if applicable.

Commit messages follow a relaxed conventional style: `feat: …`, `fix: …`, `docs: …`, `style: …`, `refactor: …`.

## Good first tasks

New to open source? These are friendly starting points:

- Add a dark mode toggle using the existing `navy-*` token scale
- Extract the pricing plan data into a typed config with tests
- Build the camera barcode-scanning demo section
- Improve Lighthouse accessibility score further and document what you fixed
- Write Vitest tests for `Reveal` and `Charts`

Comment on an issue (or open one) before starting larger work so efforts don't collide.

## Code of conduct

By participating you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md). Be kind, be useful.
