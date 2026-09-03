# Contributing to EventAtlas

Thank you for your interest in contributing to EventAtlas! Every contribution is appreciated, whether it's a bug report, feature request, documentation improvement, or code contribution.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive experience for everyone.

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **pnpm** 10 or later
- **Git**

### Setup

1. **Fork** the repository on GitHub.

2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Public_Projects.git
   cd Public_Projects/EventAtlas
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env.local
   ```

5. **Initialize database and seed**:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

6. **Start development server**:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

1. Create a new branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes in small, focused commits.

3. Write or update tests if applicable.

4. Run checks before pushing:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

5. Push your branch and open a Pull Request.

### Branch Naming

Use descriptive prefixes:

| Prefix | Purpose |
|--------|---------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation |
| `refactor/` | Code refactoring |
| `test/` | Adding tests |
| `chore/` | Maintenance tasks |

## Code Style

- Use **TypeScript** for all new code.
- Follow the existing code patterns and naming conventions.
- Use **Tailwind CSS** utility classes for styling.
- Keep components small and focused.
- Use meaningful variable and function names.
- Add types where possible; avoid `any`.

## Commit Messages

Write clear, concise commit messages:

```
feat: add event favoriting system
fix: resolve date parsing issue in event details
docs: update installation instructions
refactor: simplify event filtering logic
```

Use the imperative mood ("add feature" not "added feature").

## Pull Request Process

1. Fill in the PR template completely.
2. Ensure your code passes all checks (`lint`, `typecheck`, `build`).
3. Add screenshots if you changed UI.
4. Request a review from a maintainer.
5. Address review feedback promptly.
6. Once approved, a maintainer will merge your PR.

### PR Title

Use the same prefix format as commit messages: `feat:`, `fix:`, `docs:`, etc.

## Reporting Bugs

Use the [Bug Report template](https://github.com/Abdellox/Public_Projects/issues/new?template=bug_report.md) when opening an issue. Include:

- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node version)

## Requesting Features

Use the [Feature Request template](https://github.com/Abdellox/Public_Projects/issues/new?template=feature_request.md). Describe:

- The problem you're trying to solve
- Your proposed solution
- Alternatives you considered

---

Thank you for contributing! 🌍
