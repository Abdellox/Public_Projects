# FootLink — Developer / Agent Guide

This file helps developers and AI coding assistants work effectively in this
project without breaking it.

## Commands

Run from the `FootLink/` directory:

```bash
# Install / refresh dependencies
flutter pub get

# Static analysis (must be 0 errors)
flutter analyze

# Run the test suite
flutter test

# Run the app with Supabase keys (never hard-code them)
flutter run \
  --dart-define=SUPABASE_URL=https://YOUR-PROJECT.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=YOUR-SUPABASE-ANON-KEY

# Build a release Android app bundle
flutter build appbundle --release
```

> Note: this machine's Android Gradle build may fail with a corrupted Gradle
> `kotlin-dsl` cache (`metadata.bin`). That is an **environment** issue, not a
> code issue — `flutter analyze` and `flutter test` are the source of truth for
> code correctness. Clear `C:\Users\<user>\.gradle\caches\<ver>\kotlin-dsl` and
> retry, or build in CI.

## Layout

- `lib/core/` — config, theme, models, services, utils (no UI screens)
- `lib/features/` — screens grouped by domain (auth, home, explore, …)
- `lib/shared/` — reusable widgets and formatting helpers
- `lib/l10n/strings.dart` — all localized strings (EN / FR / AR)
- `supabase/` — `schema.sql` and `rls.sql` (source of truth for the database)
- `test/` — unit + widget tests

## Conventions

- Keep secrets out of source — always inject via `--dart-define`.
- Data access goes through Supabase so Row Level Security applies.
- No exact home addresses in code, models, or UI — only approximate locations.
- Add or update tests with any behaviour change.
- Match the style of neighbouring files; avoid new dependencies without need.
