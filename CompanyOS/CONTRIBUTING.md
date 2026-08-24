# Contributing to CompanyOS

Thank you for considering a contribution! CompanyOS is an open-source handbook that explains how companies work — and the best contributions are often **content**, not code.

> **Important:** This project lives inside the multi-project [`Public_Projects`](https://github.com/Abdellox/Public_Projects) repository. Please keep all changes inside the `CompanyOS/` folder — other projects live in sibling folders.

## Ways to contribute

| Type | Examples | Difficulty |
| --- | --- | --- |
| **Content** | Add glossary terms, improve explanations, write new scenarios | Beginner-friendly |
| **Clarity passes** | Rewrite anything confusing; add examples | Beginner-friendly |
| **Translations** | Port content to other languages | Intermediate |
| **Features** | Quizzes, learning progress UI, search filters | Intermediate |
| **Fixes** | Typos, broken links, bugs, accessibility issues | Beginner-friendly |

## The golden rule of content

Write for someone who knows **nothing** about business:

1. Give the simple definition.
2. Explain why it matters.
3. Show a real-world example.

If you had to Google a term before understanding it here — that term probably needs a better explanation (or a glossary entry).

## Getting started

Requires Node.js 18+.

```bash
# 1. Fork & clone the monorepo
git clone https://github.com/<YOUR_USERNAME>/Public_Projects.git
cd Public_Projects/CompanyOS

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open http://localhost:5173. Content changes hot-reload instantly.

## Where things live

All site content is typed data in `src/content/` — no CMS needed:

| File | Contains |
| --- | --- |
| `glossary.ts` | Glossary terms (definition + plain version + example) |
| `fundamentals.ts` | Business concepts (Revenue, CAC, Burn Rate…) |
| `lessons.ts` | Start Here course lessons |
| `departments.ts` | Department guides (roles, KPIs, workflows) |
| `scenarios.ts` | Real-world business scenarios |
| `guides.ts` / `roles.ts` / `lifecycle.ts` | How Companies Work articles, hierarchy levels, growth stages |

To add a glossary term, append an object to the array in `glossary.ts` following the existing shape — TypeScript will tell you what fields are required.

## Pull request process

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b companyos/add-churn-term
   ```
2. **Make your change** — keep it inside `CompanyOS/`.
3. **Verify it builds:**
   ```bash
   npm run build
   ```
4. **Commit** with a clear message:
   ```bash
   git commit -m "CompanyOS: add Churn and Payback Period to glossary"
   ```
5. **Push and open a PR** against `Abdellox/Public_Projects:main`.
   - Prefix your PR title with `[CompanyOS]`
   - Use one of the CompanyOS issue templates if your PR addresses an issue

## Issue templates

This repo has dedicated templates — use the **CompanyOS bug report** or **CompanyOS feature request** template when opening issues so they route correctly.

## Style guidelines

- **Tone**: friendly, direct, jargon-free. Explain acronyms on first use.
- **Length**: short paragraphs (2–4 sentences); prefer lists over walls of text.
- **Code style**: the project uses strict TypeScript with no unused variables; match existing formatting (2-space indent, double quotes).
- **No lorem ipsum**: every addition must contain realistic, finished content.

## Review process

A maintainer will review your PR, usually within a few days. Content PRs are checked for accuracy, clarity, and consistency with the writing style above. Small, focused PRs get merged fastest.

## Questions?

Open a [discussion](https://github.com/Abdellox/Public_Projects/discussions) or comment on an existing issue.
