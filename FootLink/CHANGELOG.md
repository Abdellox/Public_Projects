# Changelog

All notable changes to FootLink are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (MVP)

- Flutter project scaffold with Android + iOS targets
- Dark navy / green football-inspired theme (light + dark mode)
- Localization framework with English, French and Arabic (RTL)
- Supabase integration (auth, PostgREST, storage) via `core/services`
- Player profile model, football match, team and venue models
- SQL schema (`supabase/schema.sql`) and Row Level Security (`supabase/rls.sql`)
- Welcome, login, registration, and splash screens
- Home screen (nearby matches, teams, venues)
- Explore screen with map & list views and filters
- Match details screen with map, join/leave, chat and report
- Multi-step create-match form (6 steps)
- Teams browse/create and join-team flow
- Player profile tab with language & theme settings
- Per-match group chat with Supabase Realtime
- Tests for validators, distance, models and widgets
- CI workflow (GitHub Actions), issue templates, contribution docs
