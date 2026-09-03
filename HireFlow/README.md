# HireFlow

> A clean, modern recruitment platform where companies publish job offers, receive CVs, and manage candidates through the hiring process.

## What it solves

Hiring is often fragmented across spreadsheets, email threads, and disconnected tools. HireFlow brings the entire recruitment workflow into one platform: candidates find and apply for jobs, companies manage applications through a visual hiring pipeline, and admins oversee the platform from a central dashboard.

## Features

- **Job Marketplace** -- search, filter, and apply to jobs with location, category, type, and remote filters
- **Candidate Profiles** -- showcase skills, experience, education, and upload CVs
- **Company Dashboard** -- post jobs, review applications, manage hiring pipeline
- **Hiring Pipeline** -- move candidates through New, Reviewing, Shortlisted, Interview, Accepted, Rejected stages
- **Admin Panel** -- platform-wide statistics, user management, job moderation
- **Authentication** -- secure registration/login with role-based access (Candidate, Company, Admin)
- **Real-time Notifications** -- in-app notifications for application updates
- **Responsive Design** -- works on desktop, tablet, and mobile
- **Dark Mode** -- full light/dark theme support

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Components | shadcn/ui + Radix UI |
| Database | PostgreSQL (Neon/Supabase for prod) |
| ORM | Prisma |
| Auth | Auth.js (NextAuth v5) |
| Validation | Zod + React Hook Form |
| Charts | Recharts |
| Icons | Lucide React |
| Testing | Vitest |
| CI | GitHub Actions |
| Deployment | Vercel |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hireflow.com | admin123 |
| Candidate | jane@example.com | candidate123 |
| Company | alex@techcorp.com | company123 |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### Installation

```bash
# Clone the repository
git clone https://github.com/Abdellox/Public_Projects.git
cd Public_Projects/HireFlow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and AUTH_SECRET

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm test             # Run tests
npm run db:studio    # Prisma Studio (GUI)
npm run db:seed      # Re-seed database
npm run db:reset     # Reset database
```

## Project Structure

```
HireFlow/
  prisma/
    schema.prisma          # Database schema
    seed.ts                # Demo data seeder
  src/
    app/
      (auth)/              # Login/Register pages
      api/                 # API routes
        auth/              # NextAuth endpoints
        jobs/              # Job CRUD API
      candidate/           # Candidate dashboard & applications
      company/             # Company dashboard, jobs, applications
      admin/               # Admin dashboard
      jobs/                # Public job listings & details
    components/
      ui/                  # shadcn/ui components
      layout/              # Header, Footer
    lib/
      db.ts                # Prisma client singleton
      utils.ts             # cn() helper, utility functions
      auth.config.ts       # Auth.js configuration
      auth.ts              # Auth exports
      services/            # Business logic (jobOfferService, etc.)
      validations/         # Zod schemas
    types/                 # TypeScript type declarations
    middleware.ts          # Route protection
  .github/workflows/       # CI pipeline
```

## Architecture

- **Server Components** -- dashboard pages, job details, application lists (fast, SEO-friendly)
- **Client Components** -- forms, interactive UI, real-time updates
- **Server Actions** -- form submissions, status changes, mutations
- **API Routes** -- job search with filtering/pagination
- **Services Layer** -- business logic extracted from route handlers

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| AUTH_SECRET | Yes | Secret for Auth.js JWT signing |
| NEXT_PUBLIC_APP_URL | Yes | App base URL |
| AUTH_GITHUB_ID | No | GitHub OAuth client ID |
| AUTH_GITHUB_SECRET | No | GitHub OAuth client secret |
| RESEND_API_KEY | No | Resend API key for emails |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Distributed under the [MIT License](LICENSE).
