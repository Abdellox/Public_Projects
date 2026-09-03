# Contributing to HireFlow

Thanks for your interest in contributing! HireFlow is an open-source project and contributions of all kinds are welcome.

## Ways to Contribute

- Report bugs or suggest features via [Issues](https://github.com/Abdellox/Public_Projects/issues)
- Submit pull requests with bug fixes or new features
- Improve documentation
- Share feedback on UX/design

## Development Setup

1. Fork the repository
2. Clone your fork
3. Follow the [README](README.md) installation steps
4. Create a branch: `git checkout -b feat/my-feature`
5. Make your changes
6. Run checks before committing:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```
7. Commit with a clear message
8. Push and open a pull request

## Code Style

- **TypeScript** -- strict mode, no `any` unless absolutely necessary
- **Components** -- use shadcn/ui patterns, prefer composition over prop-drilling
- **Naming** -- `PascalCase` for components/types, `camelCase` for functions/variables
- **Files** -- keep files small and focused; one component per file
- **Imports** -- use `@/` path aliases for all src imports
- **Server vs Client** -- use server components by default; add `"use client"` only when needed

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add candidate profile editing`
- `fix: resolve job search pagination bug`
- `docs: update README with demo accounts`
- `refactor: extract services from route handlers`

## Pull Request Process

1. Fill in the PR template completely
2. Link related issues
3. Ensure all CI checks pass
4. Request a review from maintainers
5. Address review feedback

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information

## Code of Conduct

Please be respectful and constructive in all interactions. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
