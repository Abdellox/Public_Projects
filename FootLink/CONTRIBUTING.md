# Contributing to FootLink

Thanks for taking the time to contribute! FootLink is an open-source football
matchmaking app, and we welcome bug reports, feature suggestions, and pull
requests. This project lives in the `FootLink/` folder of the
[`Abdellox/Public_Projects`](https://github.com/Abdellox/Public_Projects)
repository.

## Code of conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting a bug

Open an issue using the **Bug report** template. Include:

- FootLink version and platform (Android)
- Steps to reproduce
- Expected vs actual behaviour
- Screenshots/logs if available
- Flutter version (`flutter --version`)

## Suggesting a feature

Open an issue with the **Feature request** template and describe the problem
you want to solve and how FootLink should behave.

## Development setup

```bash
# clone
git clone https://github.com/Abdellox/Public_Projects.git
cd Public_Projects/FootLink

# install dependencies
flutter pub get

# run (with your Supabase keys)
flutter run \
  --dart-define=SUPABASE_URL=https://YOUR-PROJECT.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=YOUR-SUPABASE-ANON-KEY
```

Set up Supabase by running [`supabase/schema.sql`](supabase/schema.sql) and
[`supabase/rls.sql`](supabase/rls.sql) in the Supabase SQL editor.

## Making a change

1. Create a feature branch: `git checkout -b feat/my-change`
2. Write clear, minimal, production-quality code.
3. Follow existing conventions (see [Architecture](../README.md#architecture)).
4. Add or update tests under `test/`.
5. Run the checks:
   ```bash
   flutter analyze      # should be clean (no errors)
   flutter test         # all tests should pass
   ```
6. Prefer small, focused commits with clear messages.

## Commit style

We use conventional-ish prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.

## Pull requests

- Base your PR on `main` and target `main`.
- Describe what you changed and why.
- Reference any related issues.
- Keep PRs scoped to a single concern where possible.

## Project scope

This is an **MVP** focusing on players, nearby matches, teams, maps, joining and
notifications. Payments, tournaments and advanced features are planned for later.

## Getting help

Open a discussion or issue if you are stuck. All contributions, from typos to
full features, are appreciated!
