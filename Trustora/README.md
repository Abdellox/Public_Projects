<p align="center">
  <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Flutter">
  <img src="https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white" alt="Dart">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License: MIT">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome">
  <img src="https://img.shields.io/github/issues/Trustora/Trustora?style=for-the-badge" alt="Issues">
</p>

<h1 align="center">Trustora</h1>

<p align="center">
  <strong>Find people, places, products, and services you can trust.</strong>
</p>

<p align="center">
  An open-source mobile app built with Flutter that helps users discover and rate businesses, services, and products in their local area through community-driven reviews and a trust-based rating system.
</p>

---

## The Problem

Finding trustworthy businesses and services is hard. Online reviews are often fake, manipulated, or outdated. Trustora solves this by building a community-driven platform where real users share authentic experiences and build trust through a transparent rating system.

## Screenshots

> *Screenshots coming soon*

| Home | Map View | Business Profile | Reviews |
|------|----------|-----------------|---------|
| ![Home](docs/screenshots/home.png) | ![Map](docs/screenshots/map.png) | ![Profile](docs/screenshots/profile.png) | ![Reviews](docs/screenshots/reviews.png) |

## Features

### Core
- User authentication (email, Google, Apple sign-in)
- User profiles with avatars and bio
- Search for businesses, places, products, and services
- Save favorite places and businesses
- Real-time updates across the app

### Maps
- Interactive map powered by MapLibre and OpenStreetMap
- Explore nearby businesses on the map
- Custom map markers with business categories
- Full-screen map view

### Reviews & Ratings
- Rate businesses on a 1–5 star scale
- Write and read detailed reviews
- Upload photos with reviews
- View all reviews for a business
- Upvote helpful reviews

### Business
- Business profiles with contact info, hours, and photos
- Claim and manage your business profile
- View aggregated ratings and review analytics
- Category-based browsing

### Admin
- Admin dashboard for content moderation
- Manage reported reviews and businesses
- User management tools

### Technical
- Offline support with local caching
- Push notifications via Firebase Cloud Messaging
- Clean architecture with Riverpod state management
- Responsive design for phones and tablets
- Dark mode support

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Flutter** | Cross-platform mobile framework |
| **Dart** | Programming language |
| **Supabase** | Backend-as-a-service (auth, database, storage, real-time) |
| **Riverpod** | State management |
| **GoRouter** | Declarative routing |
| **MapLibre** | Open-source map rendering |
| **OpenStreetMap** | Map data provider |
| **GitHub Actions** | CI/CD pipeline |
| **Firebase Cloud Messaging** | Push notifications |

## Database Architecture

Trustora uses Supabase (PostgreSQL) with the following key tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles and settings |
| `businesses` | Business listings and info |
| `reviews` | User reviews and ratings |
| `review_photos` | Photos attached to reviews |
| `categories` | Business/service categories |
| `favorites` | User saved businesses |
| `reports` | Reported content |
| `notifications` | User notifications |

> Full schema available in `supabase/migrations/`

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only edit their own profiles and reviews
- Admin role enforced at the database level
- API keys and secrets stored in environment variables
- No sensitive data committed to the repository

## Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.x or later)
- [Dart SDK](https://dart.dev/get-dart)
- A [Supabase](https://supabase.com) account (free tier works)
- A [Firebase](https://firebase.google.com) project (for push notifications)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Trustora/Trustora.git
   cd Trustora
   ```

2. **Install dependencies**

   ```bash
   flutter pub get
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migrations in `supabase/migrations/` against your database
   - Enable the authentication providers you want (email, Google, Apple)

4. **Configure environment variables**

   Create a `.env` file in the project root:

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials (see [Environment Variables](#environment-variables) below).

5. **Run the app**

   ```bash
   flutter run
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | (Optional) Supabase service role key for admin operations |

Never commit your `.env` file. It is included in `.gitignore`.

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── app.dart                     # MaterialApp configuration
├── core/                        # Core utilities and constants
│   ├── constants/
│   ├── theme/
│   ├── utils/
│   └── router/
├── features/                    # Feature modules
│   ├── auth/                    # Authentication
│   ├── home/                    # Home screen
│   ├── map/                     # Map view
│   ├── business/                # Business profiles
│   ├── review/                  # Reviews and ratings
│   ├── profile/                 # User profiles
│   ├── search/                  # Search functionality
│   ├── favorites/               # Saved businesses
│   ├── admin/                   # Admin dashboard
│   └── settings/                # App settings
├── models/                      # Data models
├── services/                    # API and service layers
├── widgets/                     # Shared widgets
└── l10n/                        # Localization
```

## Database Schema

SQL migration files are located in:

```
supabase/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_add_reviews.sql
    └── ...
```

Run migrations in order against your Supabase database via the SQL Editor.

## Testing

```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Run integration tests
flutter test integration_test/
```

## Free Services Used

Trustora is built entirely on free-tier services:

| Service | Free Tier |
|---------|-----------|
| Supabase | 500MB database, 1GB file storage, 50K monthly active users |
| Firebase Cloud Messaging | Unlimited messages |
| OpenStreetMap | Free, open-source map data |
| MapLibre | Free, open-source map rendering |
| GitHub Actions | 2,000 minutes/month for public repos |

## Roadmap

- [ ] In-app messaging between users
- [ ] Business owner dashboard
- [ ] Photo upload for reviews
- [ ] Multi-language support (i18n)
- [ ] Accessibility improvements (WCAG compliance)
- [ ] Offline-first architecture
- [ ] Advanced search filters
- [ ] Social features (follow users, review feeds)

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by the Trustora community
</p>
