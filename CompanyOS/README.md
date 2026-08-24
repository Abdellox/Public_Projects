# CompanyOS

> **Understand how companies work.**

CompanyOS is an open-source reference and learning platform that explains how companies work from the inside. It is built for employees, interns, students, managers, founders, and anyone who wants to understand business and organizational structures.

CompanyOS is **not** an MBA replacement. It is a practical, plain-language handbook covering departments, hierarchy, business fundamentals, company structures, terminology, and how different parts of a company actually work together.

**Live demo:** coming soon · **Part of:** [Abdellox/Public_Projects](https://github.com/Abdellox/Public_Projects)

---

## Why CompanyOS?

Most people learn their job. Few people learn how the whole company works.

- You join a company and hear words like *ARR*, *runway*, *OKR*, *CAC* — nobody explains them.
- You know your role, but not how Finance, Sales, Marketing, Product, and Operations connect.
- Business education is either too academic or too expensive.

CompanyOS fixes this with short, practical explanations written for someone who knows **nothing** about business.

Every concept follows one rule:

1. **Simple definition** — what is it, in plain language?
2. **Why it matters** — why should you care?
3. **Real-world example** — what does it look like in practice?

---

## Content

| Section | What you'll learn |
| --- | --- |
| **Start Here** | A 10-lesson guided path: what a company is, how it makes money, how decisions get made |
| **How Companies Work** | Company types, sizes, org structures, departments, hierarchy, decision-making |
| **Departments** | Executive, Finance, Sales, Marketing, HR, Operations, Product, Engineering, IT, Customer Success, Legal, Procurement — responsibilities, roles, KPIs, workflows |
| **Business Fundamentals** | Revenue, costs, profit, cash flow, budgets, KPIs, OKRs, strategy, business models, pricing |
| **Roles & Hierarchy** | From Intern to CEO — what each level does and how they interact |
| **Company Lifecycle** | Startup → Small → Growth → Medium → Enterprise: structure, management, challenges at every stage |
| **Real-World Scenarios** | "Sales dropped 20%", "A major customer is leaving", "Preparing for an IPO" — who cares, what data, what happens next |
| **Glossary** | 55+ business terms with definitions, simple explanations, and examples |

---

## Features

- Global search across all content (`Ctrl/Cmd + K`)
- Dark / light mode (system-aware)
- Reading progress indicator, table of contents, breadcrumbs
- Previous/next navigation and related content on every article
- Fully responsive, keyboard accessible, semantic HTML
- SEO-friendly page structure with per-page metadata

---

## Tech Stack

- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Vite](https://vite.dev)
- [React Router v7](https://reactrouter.com)

Design principles: premium documentation-style UI inspired by Linear, Stripe, Notion, GitBook, and Vercel. Minimal, professional, accessible.

---

## Project Structure

```text
CompanyOS/
├── public/              # Static assets (favicon)
├── src/
│   ├── components/      # Reusable UI (Header, Footer, SearchModal, ArticleLayout…)
│   ├── content/         # All site content as typed data (easy to migrate to a CMS later)
│   │   ├── lessons.ts        # Start Here course (10 lessons)
│   │   ├── departments.ts    # 12 department guides
│   │   ├── fundamentals.ts   # 18 business concepts
│   │   ├── scenarios.ts      # 7 real-world scenarios
│   │   ├── glossary.ts       # 55+ glossary terms
│   │   ├── guides.ts         # How Companies Work articles
│   │   ├── roles.ts          # Hierarchy levels
│   │   ├── lifecycle.ts      # Company growth stages
│   │   └── types.ts          # Shared TypeScript types
│   ├── lib/             # Utilities (theme, search index, SEO hook)
│   └── pages/           # One file per route section
├── CONTRIBUTING.md      # How to contribute
├── CODE_OF_CONDUCT.md
├── LICENSE              # MIT
└── README.md
```

All content lives in typed data files under `src/content/` — pages render from data. This keeps the app static-first while making it trivial to plug in a CMS, API, or database later.

---

## Roadmap

CompanyOS starts **static-first**: high-quality content now, platform features later — without rebuilding anything.

- **v1 — Static Handbook** ✅ *(current)*
  Full content, responsive design, dark/light mode, SEO-friendly pages
- **v2 — Search & Progress**
  Enhanced search filters, learning progress, quizzes
- **v3 — Accounts**
  Personalized learning paths, saved lessons
- **v4 — Team Workspaces**
  Company-specific onboarding and internal handbooks
- **v5 — AI Tutor**
  Ask questions, get explanations tailored to your role
- **v6 — Community**
  Contributions, translations, community-curated content

---

## Getting Started

Requires Node.js 18+.

```bash
# Clone the repository
git clone https://github.com/Abdellox/Public_Projects.git
cd Public_Projects/CompanyOS

# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## Contributing

Contributions are very welcome! Content improvements matter more than code — if an explanation confused you, it will confuse others.

Good first contributions:

- Add glossary terms you had to Google yourself
- Improve clarity of any lesson, guide, or department page
- Suggest new scenarios from your own work experience
- Fix typos, bugs, accessibility issues

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, and please note: this project lives inside the multi-project `Public_Projects` monorepo — keep changes inside the `CompanyOS/` folder.

---

## License

Released under the [MIT License](LICENSE).

---

<div align="center">

**CompanyOS** — *Understand how companies work.*

</div>
