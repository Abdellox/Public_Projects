# 🌍 EventAtlas

**Discover local and global events near you.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/CONTRIBUTING.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)

EventAtlas is an open-source events discovery platform where users can find, create, and manage events across cities and countries worldwide. Organizers can publish events, and administrators can moderate the platform.

---

## ✨ Features

- 🔍 **Event Discovery** — Search and filter events by category, city, date, price
- 🗺️ **Interactive Map** — View events on an OpenStreetMap-powered map
- 🔐 **Authentication** — Register, login, and manage your account securely
- ❤️ **Favorites** — Save events you're interested in
- 📋 **Registrations** — Register interest in events
- ⏰ **Reminders** — Set reminders for upcoming events
- 📤 **Sharing** — Share events on social media or copy links
- 🏢 **Organizer Dashboard** — Create, edit, and manage your events
- ⭐ **Featured Events** — Highlight important events on the platform
- 🛡️ **Admin Panel** — Manage users, events, categories, countries, and cities
- 📱 **Responsive Design** — Works beautifully on mobile, tablet, and desktop
- 🌙 **Dark Mode** — Toggle between light and dark themes
- ⚡ **Fast** — Optimized with server-side rendering and image optimization

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe code |
| **Tailwind CSS v4** | Utility-first styling |
| **Prisma** | Database ORM |
| **SQLite / PostgreSQL** | Database |
| **NextAuth v5** | Authentication |
| **Zod** | Schema validation |
| **React Hook Form** | Form management |
| **Leaflet + OpenStreetMap** | Interactive maps |
| **Recharts** | Analytics charts |
| **bcryptjs** | Password hashing |
| **lucide-react** | Icons |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 10+

### 1. Clone the repository

```bash
git clone https://github.com/Abdellox/Public_Projects.git
cd Public_Projects/EventAtlas
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment

```bash
cp .env.example .env.local
```

### 4. Initialize database and seed data

```bash
pnpm db:push
pnpm db:seed
```

### 5. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@eventatlas.com` | `admin123` |
| Organizer | `organizer@eventatlas.com` | `organizer123` |
| User | `user@eventatlas.com` | `user123` |

## 📂 Project Structure

```
EventAtlas/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── events/            # Event pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── organizer/         # Organizer dashboard
│   │   ├── admin/             # Admin dashboard
│   │   ├── login/             # Auth pages
│   │   ├── register/          # Registration
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Header, Footer, Sidebar
│   │   ├── events/            # Event-specific components
│   │   ├── home/              # Landing page components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── maps/              # Map components
│   │   └── auth/              # Auth components
│   └── lib/
│       ├── auth.ts            # NextAuth configuration
│       ├── db.ts              # Prisma client
│       ├── utils.ts           # Utility functions
│       ├── constants.ts       # App constants
│       └── validations.ts     # Zod schemas
├── .github/
│   ├── CONTRIBUTING.md        # Contribution guidelines
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/ci.yml       # CI pipeline
├── Dockerfile                 # Docker build
├── docker-compose.yml         # Docker Compose
├── LICENSE                    # MIT License
└── README.md                  # This file
```

## 🗄️ Database

EventAtlas uses Prisma with SQLite by default. For production, switch to PostgreSQL:

1. Change `provider` in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `DATABASE_URL` in `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/eventatlas"
   ```

3. Run migrations:
   ```bash
   pnpm db:migrate:prod
   ```

### Key Models

- **User** — Accounts, roles (USER / ORGANIZER / ADMIN)
- **OrganizerProfile** — Organizer details
- **Event** — Full event data with status workflow
- **Category** — Event categories (15 default)
- **Country / City** — Geography hierarchy
- **Favorite / Registration / Reminder** — User interactions
- **EventReport** — Community moderation
- **Notification** — User notifications

## 🧪 Testing

```bash
# Unit tests
pnpm test:run

# Build check
pnpm build
```

## 🐳 Docker

```bash
docker compose up --build
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy

### Docker

```bash
docker compose -f docker-compose.yml up -d
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details.

- Fork the repository
- Create a feature branch
- Make your changes
- Submit a pull request

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## 🔮 Roadmap

- [ ] External event API imports (Eventbrite, Meetup)
- [ ] Email notifications with Resend
- [ ] Image uploads with UploadThing
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] End-to-end tests with Playwright
- [ ] Performance monitoring

---

Built with ❤️ by the open-source community.
