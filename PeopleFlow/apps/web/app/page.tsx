import Link from "next/link";

const FEATURES = [
  ["People directory", "Rich employee profiles with org chart, departments, teams and custom fields."],
  ["Leave management", "Policies, balances, approvals and a shared team calendar."],
  ["Attendance", "Clock in/out, timesheets and manual corrections."],
  ["Documents", "Secure storage with versioning, expiry tracking and granular visibility."],
  ["Performance", "Goals, review cycles, self and manager reviews, peer feedback."],
  ["Recruiting", "Job openings, candidate pipeline, interviews and feedback."],
  ["Training", "Courses, assignments with due dates and certifications."],
  ["Workflows & tasks", "Onboarding/offboarding templates that generate tasks automatically."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <span className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">PF</span>
          PeopleFlow
        </span>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-lg px-3.5 py-2 font-medium text-zinc-600 hover:text-zinc-900">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-lg bg-brand-600 px-3.5 py-2 font-medium text-white shadow-sm hover:bg-brand-700">
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <section className="py-20 text-center lg:py-28">
          <p className="mb-4 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Open source · Apache-2.0 · Self-hosted or cloud
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            Everything your people need,{" "}
            <span className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">in one place</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-500">
            PeopleFlow is the open-source HR platform for growing teams: people management, leave,
            attendance, documents, performance, recruiting and training — without spreadsheets.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Create your workspace
            </Link>
            <a
              href="https://github.com/peopleflow/peopleflow"
              className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              View on GitHub
            </a>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} PeopleFlow · Apache License 2.0 · Built by the community
      </footer>
    </div>
  );
}
