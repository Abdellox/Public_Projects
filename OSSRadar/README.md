# OSS Radar

**Discover GitHub projects you can actually contribute to.**

OSS Radar scans GitHub in real time and surfaces beginner-friendly issues (`good first issue`, `help wanted`) plus trending repositories — so you spend less time searching and more time contributing.

> This project lives in the [`OSSRadar/`](.) folder of the [Public_Projects](https://github.com/Abdellox/Public_Projects) monorepo.

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#quickstart">Quickstart</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#roadmap">Roadmap</a> ·
  <a href="#contributing">Contributing</a>
</p>

## Features

- **Discover feed** — live search of open issues labeled `good first issue` / `help wanted`, filterable by language, sort order, and free-text query.
- **Trending repositories** — projects created in the last 30 days that are already collecting stars, plus an all-time hall of fame.
- **Zero database** — everything is fetched live from the GitHub REST API and cached server-side; no data collection, no auth required to browse.
- **Rate-limit friendly** — responses are cached for 10 minutes per query; add a `GITHUB_TOKEN` to jump from 60 to 5,000 requests/hour.
- **Contributor-first codebase** — small components, typed end-to-end, and a roadmap full of bite-sized tasks.

## Tech stack

| Layer     | Choice                              |
| --------- | ----------------------------------- |
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language  | TypeScript (strict)                 |
| Styling   | Tailwind CSS                        |
| Data      | GitHub REST API (search endpoints)  |

## Quickstart

```bash
git clone https://github.com/Abdellox/Public_Projects
cd Public_Projects/OSSRadar
npm install
npm run dev
```

Open http://localhost:3000.

### Optional: higher rate limits

Copy the example env file and paste a token (no scopes needed — public data only):

```bash
cp .env.example .env.local
```

Create a token at https://github.com/settings/tokens.

## How it works

```
Browser ──> Next.js server component ──> GitHub Search API
                    │
                    └── fetch cache (revalidate: 10 min)
```

1. Filters live in the URL (`/?label=hw&language=rust&sort=comments`) — every view is shareable and server-rendered.
2. The server queries `GET /search/issues` or `GET /search/repositories` with qualifiers like `state:open label:"good first issue" language:rust`.
3. Results are cached by Next's fetch cache, so repeated visits don't consume rate limit.

## Project structure

```
app/
  page.tsx              # Discover feed (issues)
  trending/page.tsx     # Trending repositories
  layout.tsx            # Shell + metadata
components/             # Cards, filters, header/footer, states
lib/
  github.ts             # GitHub API client (caching + error types)
  utils.ts              # Formatting helpers
types/github.ts         # API response types
```

## Roadmap

- [ ] Repository detail pages with contributor statistics
- [ ] "Unclaimed only" filter (issues with no assignees/comments)
- [ ] Saved lists & email/RSS digests
- [ ] Recommendation engine ("repos similar to ones you starred")
- [ ] User profiles with contribution history
- [ ] i18n support
- [ ] Self-hosting guide (Docker)

Have an idea? Open an issue — the roadmap is intentionally unfinished so contributors can shape it.

## Contributing

PRs are extremely welcome — this project exists to be a friendly on-ramp into open source. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and good first tasks.

## License

[MIT](LICENSE)
