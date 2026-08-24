# Stockly

> **Know your stock. Grow your business.**

Stockly is a simple inventory and stock management platform for small and medium-sized businesses — retail shops, clothing stores, grocery stores, electronics stores, small warehouses, and ecommerce sellers. This repository contains the Stockly marketing site and dashboard experience: a polished landing page with a fully interactive inventory dashboard preview.

![License](https://img.shields.io/badge/license-MIT-emerald)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
![React](https://img.shields.io/badge/React-18-61dafb)
![Vite](https://img.shields.io/badge/Vite-6-646cff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)

## What's inside

- **Landing page** — hero with a live-looking dashboard mockup, feature grid, how-it-works steps, pricing with monthly/yearly toggle, testimonials, FAQ accordion, and final CTA.
- **Interactive dashboard preview** — switchable sidebar navigation, KPI cards (total products, stock value, low stock, out of stock), inventory value area chart, stock movement bar chart, low-stock table, and a recent activity feed.
- **Zero chart dependencies** — all charts are hand-rolled SVG components, so the bundle stays tiny (~58 KB gzipped total).
- **Accessible & responsive** — semantic HTML, skip-to-content link, keyboard-friendly FAQ and menus, mobile-first at every breakpoint, `prefers-reduced-motion` respected.

## Features

| | |
| --- | --- |
| Real-time inventory | Know exactly how much stock you have |
| Barcode scanning | Scan products with your phone or scanner |
| Low-stock alerts | Get notified before you run out |
| Stock movements | Track every stock-in and stock-out |
| Product management | SKUs, prices, categories, suppliers, images |
| Reports | Simple, useful inventory reports |
| Import from Excel | Move existing inventory in minutes |
| Multi-location | Manage multiple stores or warehouses |

## Tech stack

- [React 18](https://react.dev) + [Vite 6](https://vite.dev)
- [Tailwind CSS 4](https://tailwindcss.com) with a custom `navy`/`emerald` design token theme
- Custom SVG charts (no charting library)
- Inter typeface

## Getting started

Prerequisites: **Node.js 18+** and npm.

```bash
# clone this repository (or just download the Stockly folder)
cd Stockly
npm install
npm run dev       # start the dev server → http://localhost:5173
```

Other scripts:

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## Project structure

```
Stockly/
├── index.html              # entry point, fonts, SEO meta
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # React bootstrap
    ├── index.css           # Tailwind v4 theme tokens (@theme) + base styles
    ├── App.jsx             # page composition
    └── components/
        ├── Navbar.jsx          # sticky nav, blur-on-scroll, mobile menu
        ├── Hero.jsx            # headline + dashboard mockup
        ├── TrustSection.jsx    # business categories strip
        ├── Features.jsx        # 8-feature grid
        ├── HowItWorks.jsx      # 3-step explainer
        ├── DashboardPreview.jsx# interactive sidebar + charts + tables
        ├── Pricing.jsx         # plans + billing toggle
        ├── Testimonials.jsx    # placeholder quotes (swap in real ones!)
        ├── Faq.jsx             # accessible accordion
        ├── FinalCta.jsx
        ├── Footer.jsx
        ├── Charts.jsx          # SVG AreaChart / BarChart
        ├── Reveal.jsx          # IntersectionObserver scroll animations
        ├── SectionHeading.jsx
        ├── Logo.jsx
        └── icons.jsx           # inline stroke icon set
```

### Design system quick reference

Design tokens live in `src/index.css` under `@theme`:

- **Colors:** `navy-*` scale for text/surfaces, built-in `emerald-*` as the primary accent
- **Animations:** `animate-fade-up`, `animate-float-slow` (plus scroll reveals via `<Reveal>`)

## Roadmap

Ideas we'd love help with (see [CONTRIBUTING.md](CONTRIBUTING.md)):

- [ ] Camera-based barcode scanning demo page
- [ ] Working Excel import flow (mock backend)
- [ ] Dark mode
- [ ] Additional report views (top movers, dead stock, valuation history)
- [ ] i18n support
- [ ] Tests (Vitest + Testing Library / Playwright)

## Contributing

Contributions are welcome! This project lives in the multi-project [Public_Projects](https://github.com/Abdellox/Public_Projects) monorepo — please read the [contribution guide](CONTRIBUTING.md) first, use the **[Stockly]** issue templates when reporting bugs or suggesting features, and keep pull requests inside the `Stockly/` folder.

## License

Released under the [MIT License](LICENSE).
