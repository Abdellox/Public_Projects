# Contributing to Trustora

Thank you for your interest in contributing to Trustora! We welcome contributions from everyone. This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to treat all contributors and users with respect. Be kind, constructive, and inclusive.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/Trustora/Trustora/issues) to avoid duplicates.
2. Open a new issue using the **Bug Report** template.
3. Provide as much detail as possible (steps to reproduce, screenshots, environment).

### Suggesting Features

1. Open a new issue using the **Feature Request** template.
2. Describe the problem your feature would solve.
3. Explain how you envision it working.

### Submitting Code

1. **Fork** the repository.
2. **Create a branch** from `main` with a descriptive name:
   ```bash
   git checkout -b feature/add-business-search
   ```
3. **Make your changes** following the code style guidelines below.
4. **Write or update tests** for your changes.
5. **Run tests** to ensure nothing is broken:
   ```bash
   flutter test
   ```
6. **Commit** with a clear message (see [Commit Messages](#commit-messages)).
7. **Push** your branch and open a **Pull Request**.

## Development Setup

1. Follow the [installation instructions](README.md#getting-started) in the README.
2. Make sure all tests pass before making changes:
   ```bash
   flutter test
   ```
3. Create your feature branch from `main`.

## Code Style

- Follow the [Flutter linting rules](https://dart.dev/tools/analysis) defined in `analysis_options.yaml`.
- Use **clean architecture**: separate features, models, services, and widgets.
- Keep widgets small and focused on a single responsibility.
- Name files in `snake_case.dart`.
- Name classes in `PascalCase`.
- Use meaningful variable and function names.
- Avoid magic numbers and strings — use constants.
- Format all Dart code with `dart format`.

Run the formatter and analyzer before committing:

```bash
dart format .
flutter analyze
```

## Commit Messages

Use clear, descriptive commit messages. Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring (no feature or fix) |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks (dependencies, CI, etc.) |

### Examples

```
feat(review): add photo upload for reviews
fix(auth): handle expired session token
docs: update README with setup instructions
refactor(map): extract marker widget into separate file
```

## Pull Request Guidelines

- Keep PRs focused on a single change.
- Provide a clear description of what changed and why.
- Reference related issues (e.g., `Closes #42`).
- Ensure all tests pass and the code is lint-clean.
- Request a review from a maintainer.
- Be responsive to feedback and make requested changes promptly.

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests added or updated for new/changed functionality
- [ ] All existing tests pass (`flutter test`)
- [ ] No new analyzer warnings (`flutter analyze`)
- [ ] Documentation updated if needed
- [ ] Commit messages are clear and descriptive

## Issue Guidelines

- Use the provided issue templates.
- Search existing issues before creating new ones.
- Keep issues focused on a single topic.
- Provide reproduction steps for bugs.
- Be respectful and constructive.

## Where to Ask for Help

- **GitHub Discussions**: For general questions and ideas.
- **Issues**: For bug reports and feature requests.
- **Pull Requests**: For code review and collaboration.

---

Thank you for helping make Trustora better! 🎉
