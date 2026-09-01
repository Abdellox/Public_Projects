<div align="center">

<img src="assets/branding/logo.svg" width="120" alt="FootLink logo"/>

# FootLink

### *Find your team. Play nearby.*

[![Flutter](https://img.shields.io/badge/Flutter-3.38-blue?logo=flutter)](https://flutter.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android-blueviolet)](#)
![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

FootLink is an **international football matchmaking app**. It helps players find
nearby football matches, join teams, create games, invite friends, and connect
with people in the same city — so a player in **Rabat** mainly sees matches and
players close to **Rabat**, not people hundreds of kilometres away.

</div>

---

## Table of contents

- [The problem](#the-problem)
- [Features](#features)
- [Screens](#screens)
- [Technology stack](#technology-stack)
- [Database](#database)
- [Architecture](#architecture)
- [Location & privacy](#location--privacy)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Testing](#testing)
- [Free services used](#free-services-used)
- [Future improvements](#future-improvements)
- [Play Store](#play-store)
- [Contributing](#contributing)

---

## The problem

Organising a casual football game is hard. Most players rely on scattered
WhatsApp groups or Facebook pages, and discovering strangers to play with in
your own *city* is even harder. FootLink solves this with a simple, safe, and
fast mobile app that matches you with **nearby** players and matches.

## Features

### Players
- Register & log in (email/password, email verification, optional Google)
- Profile: photo, nickname, age range, **country & city**, position, skill
- Football positions (Goalkeeper → Flexible) and skill levels (Beginner → Advanced)
- Preferred match format (5 / 7 / 9 / 11-a-side), playing days & times
- Preferred match distance filter (2 km → anywhere in country)
- Find nearby matches, join or create matches
- Join or create teams, invite friends
- Group chat per match, ratings, fair-play badges
- Report & block unsafe users
- Push notifications

### Team captains
- Create a team with name, logo, city, description, skill level
- Accept/reject join requests, manage members, add rules
- Create matches and view match history

### Venue owners *(planned / MVP-later)*
- Register a venue, add photos, opening hours, prices, facilities
- Manage fields and confirm bookings

### Administrators *(planned / MVP-later)*
- Manage users, matches, venues, reports; suspend accounts; view stats

> **MVP scope** focuses on: players, nearby matches, teams, maps, joining and
> notifications. Payments, tournaments, advanced statistics and professional
> team management come later.

## Screens

- Welcome / Login / Register / Forgot password / Choose country & city
- **Home** — current city, nearby matches, matches today & this week, teams, venues
- **Explore** — map & list views, search, distance/date/skill/format/price filters
- **Match details** — organizer, countdown, venue, map, positions, fee, rules, chat
- **Create match** — 6-step form (info → date/time → location → players → price → publish)
- **Teams** — browse, view, create, request to join
- **Player profile** — photo, stats, badges, availability, ratings
- **Notifications** and **Chat** (per match)

## Technology stack

| Layer       | Technology |
|-------------|------------|
| Mobile      | [Flutter](https://flutter.dev) / Dart |
| Auth & DB   | [Supabase](https://supabase.com) (free plan) |
| Database    | PostgreSQL via Supabase |
| Maps        | [MapLibre](https://maplibre.org) + [flutter_map](https://pub.dev/packages/flutter_map) on [OpenStreetMap](https://www.openstreetmap.org) |
| Storage     | Supabase Storage (profile & team images) |
| Push        | Firebase Cloud Messaging *(optional)* |
| CI/CD       | GitHub Actions |
| Hosting     | Vercel / Render *(optional backend)* |
| Design      | Figma (free) |

## Database

The schema lives in [`supabase/schema.sql`](supabase/schema.sql) and the
security policies in [`supabase/rls.sql`](supabase/rls.sql). Key tables:

`users`, `player_profiles`, `teams`, `team_members`, `team_join_requests`,
`matches`, `match_players`, `venues`, `venue_bookings`, `countries`, `cities`,
`positions`, `player_availability`, `reviews`, `ratings`, `messages`,
`notifications`, `favorites`, `reports`, `blocked_users`, `badges`, `user_badges`.

Design notes:

- UUID primary keys, foreign keys, composite unique constraints
- Indexes on `city`, `country`, `(latitude, longitude)`, `date_time`, `skill_level`
- `created_at` / `updated_at` timestamps on every table (auto `updated_at` trigger)
- **Row Level Security** enabled with permissive policies
- No exact home addresses are stored — only approximate coordinates

## Architecture

```
lib/
├── main.dart                  # bootstrap (settings + Supabase init)
├── app.dart                   # MaterialApp root, themes, localization
├── core/
│   ├── config/                # AppConfig (no secrets hard-coded)
│   ├── theme/                 # AppColors, AppTheme (dark navy + green)
│   ├── models/                # enums, UserProfile, FootballMatch, Team, Venue…
│   ├── services/              # Supabase, Auth, Settings, (Location)
│   └── utils/                 # validators, distance/haversine
├── features/                  # per-feature screens
│   ├── auth/                  # splash, welcome, login, register
│   ├── home/                  # home, main shell (bottom nav)
│   ├── explore/               # explore, match_repository, filters
│   ├── match_details/
│   ├── create_match/
│   ├── chat/
│   ├── teams/
│   └── profile/
├── l10n/                      # strings.dart (EN / FR / AR + RTL)
└── shared/
    ├── utils/                 # Format helpers
    └── widgets/               # MatchCard, ProfileAvatar, EmptyState…
```

State management uses lightweight `ChangeNotifier` + `Provider`; all database
access goes through Supabase so **Row Level Security** is enforced server-side.

## Location & privacy

- Only **approximate** distances are shown (haversine in `core/utils/distance.dart`)
- Players choose a **preferred distance** — matches further away are hidden
- Exact home addresses are **never** stored or displayed; only public venues /
  meeting points and an approximate map pin are shown
- Players choose the city/country and can hide their location
- Jitter/rounding helpers exist to further protect precise coordinates

## Getting started

### Prerequisites
- Flutter 3.38+ ([install](https://docs.flutter.dev/get-started/install))
- Android Studio / Android SDK (for Android builds)
- A [Supabase](https://supabase.com) project (free plan)

### 1. Clone & install
```bash
git clone https://github.com/Abdellox/Public_Projects.git
cd Public_Projects/FootLink
flutter pub get
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL editor**, run [`supabase/schema.sql`](supabase/schema.sql),
   then [`supabase/rls.sql`](supabase/rls.sql).
3. Copy your project URL and anon key.

### 3. Run the app
Provide your keys at run time (never hard-code them):
```bash
flutter run \
  --dart-define=SUPABASE_URL=https://YOUR-PROJECT.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=YOUR-SUPABASE-ANON-KEY
```

## Environment variables

| Variable               | Required | Description                                    |
|------------------------|----------|------------------------------------------------|
| `SUPABASE_URL`         | yes      | Supabase project URL                            |
| `SUPABASE_ANON_KEY`    | yes      | Supabase public (anon) key — never `service_role` |
| `FCM_SERVER_KEY`       | no       | Firebase Cloud Messaging server key             |
| `GOOGLE_CLIENT_ID`     | no       | Google sign-in client id                        |

Copy the example and fill in your values (do not commit real keys):
```bash
cp .env.example .env   # then fill it in
```

## Testing

```bash
flutter test
```

Test coverage includes: validators (registration/login), distance & location
filtering, match availability/fill logic, model JSON round-trips, and widget
smoke tests. CI runs the same suite via GitHub Actions (see
`.github/workflows/ci.yml`).

## Free services used

- **Flutter** – app framework
- **Supabase (free plan)** – auth, PostgreSQL, storage, realtime
- **OpenStreetMap** – map tiles (free, non-commercial)
- **PostgreSQL** – the relational database
- **GitHub Actions** – free CI for public repos
- **GitHub** – source control & hosting
- **Figma (free)** – design

## Future improvements

- Payments / paid-match checkout (MVP uses an external payment/contact link)
- Tournaments and league management
- Advanced statistics and analytics
- Professional team management & scouting
- Venue owner booking system
- Admin moderation dashboard
- Web (Flutter web) support

## Play Store

This MVP is a **pre-release** targeting the Android Play Store.

```bash
flutter build appbundle --release
```

The output AAB will be at `build/app/outputs/bundle/release/app-release.aab`.
Upload it via [Google Play Console](https://play.google.com/console).

> **Note:** use your own release keystore. See
> [Flutter signing docs](https://docs.flutter.dev/deployment/android).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and
our [Code of Conduct](CODE_OF_CONDUCT.md). For security issues, see
[SECURITY.md](SECURITY.md).

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">Made with ⚽ by <a href="https://github.com/Abdellox">@Abdellox</a></div>
