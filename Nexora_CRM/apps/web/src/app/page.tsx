import Link from 'next/link';
import { Button, Card, Logo } from '@nexora/ui';

const features = [
  {
    title: 'Contacts & Companies',
    description:
      'Every person and organization in one place, with custom fields, tags, owners and complete activity history.',
  },
  {
    title: 'Leads & Pipelines',
    description:
      'Custom pipelines and stages with kanban boards. Move leads to deals and watch revenue flow.',
  },
  {
    title: 'Customer Timeline',
    description:
      'Calls, emails, meetings, notes and tasks — the entire relationship on a single timeline.',
  },
  {
    title: 'Teams & Permissions',
    description:
      'Departments, teams, custom roles and fine-grained permissions. Isolation enforced server-side.',
  },
  {
    title: 'Search Everything',
    description:
      'Global search across every record, always filtered by what you are allowed to see.',
  },
  {
    title: 'AI Assistant',
    description:
      'Optional, provider-agnostic AI that summarizes history and drafts follow-ups — without bypassing authorization.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
          <p className="mb-4 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Open source · Cloud or self-hosted
          </p>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold tracking-tight text-neutral-900 sm:text-6xl">
            Your customers.{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
              Your team.
            </span>{' '}
            One open platform.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Nexora CRM helps you manage customers, leads, sales pipelines and
            communication in one fast, secure platform. Use it in the cloud or
            host it yourself — it is yours either way.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link href="/register">
              <Button className="h-12 px-6 text-base">Create your workspace</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="h-12 px-6 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-y border-neutral-100 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              Everything a modern team needs
            </h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="p-6 transition-shadow hover:shadow-md">
                  <h3 className="font-semibold text-neutral-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              Two ways to run Nexora
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <Card className="p-8">
                <h3 className="text-xl font-semibold">Cloud</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  Create an account, invite your team and start selling in
                  minutes. We handle backups, updates and uptime.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-neutral-600">
                  <li>Zero setup</li>
                  <li>Managed infrastructure</li>
                  <li>Automatic upgrades</li>
                </ul>
              </Card>
              <Card className="p-8">
                <h3 className="text-xl font-semibold">Self-hosted</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  Clone the repository, deploy on your own infrastructure and
                  keep full control of your data. No features held back.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-neutral-600">
                  <li>Docker deployment</li>
                  <li>Your servers, your data</li>
                  <li>Infinitely customizable</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo />
          <p className="text-sm text-neutral-500">
            Open source under Apache-2.0. Built by the community.
          </p>
        </div>
      </footer>
    </div>
  );
}
