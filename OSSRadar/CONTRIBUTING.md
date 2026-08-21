# Contributing to OSS Radar

Thanks for wanting to contribute! This project is designed to be a gentle on-ramp into open source.

## Setup

```bash
git clone https://github.com/Abdellox/Public_Projects
cd Public_Projects/OSSRadar
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npm run build      # type-checks + production build
```

Optional but recommended: create `.env.local` from `.env.example` and add a GitHub token (no scopes needed).

## Good first tasks

Not sure where to start? Any of these would be a great first PR:

1. **Add a language** to the filter lists in `components/FilterBar.tsx` and `components/LanguageSelect.tsx`.
2. **Add a sort option** (e.g. "most commented") — see `SORT_OPTIONS` in `FilterBar.tsx`.
3. **Improve empty states** with better copy or illustrations in `components/states.tsx`.
4. **Add tests** for `lib/utils.ts` helpers (Vitest or Jest — your call, propose it in an issue first).
5. **Accessibility pass**: focus rings, aria labels, keyboard navigation for filters.

Bigger ideas live in the README roadmap. Open an issue before large changes so we can align.

## Ground rules

- Keep PRs small and focused — one feature or fix per PR.
- Match existing code style (TypeScript strict, no default exports except route files).
- No new dependencies without discussion.
- Be kind. First-time contributors are the whole point of this project.

## Reporting bugs

Open an issue with:
- What you did / what you expected / what happened
- The URL (including query params) you were on
