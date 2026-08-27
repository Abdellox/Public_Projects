import Link from "next/link";
import {
  BookIcon,
  BuildingIcon,
  ChatIcon,
  PeopleIcon,
  SearchIcon,
  SparkIcon
} from "../components/icons";

const FEATURES = [
  {
    icon: BuildingIcon,
    title: "A real organizational structure",
    body: "Departments, teams and job titles are modeled digitally — custom-defined by your organization, never hardcoded."
  },
  {
    icon: ChatIcon,
    title: "Two kinds of conversation",
    body: "Fast real-time chat for the moment. Durable discussions that keep their context, resolution state and history forever."
  },
  {
    icon: BookIcon,
    title: "Knowledge that compounds",
    body: "Solved discussions become searchable knowledge articles through an approval workflow. Organizational memory stops evaporating."
  },
  {
    icon: SparkIcon,
    title: "AI that respects permissions",
    body: "Assistants for the company, each department and every team — retrieving only what the asking person is authorized to see."
  },
  {
    icon: SearchIcon,
    title: "Search across everything",
    body: "People, discussions, knowledge, messages and expertise — filtered by what you can actually access."
  },
  {
    icon: PeopleIcon,
    title: "Expertise discovery",
    body: "\"Who has worked on Kafka scaling?\" Find colleagues by skill and experience instead of asking around in the dark."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-ink-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold">
            N
          </span>
          NEXORA
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-white px-4 py-2 font-medium text-ink-950 transition-colors hover:bg-white/90"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-brand-600/30 blur-[120px]"
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-20 text-center sm:pt-28">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              Open source · Self-hostable · Multi-tenant
            </p>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Your company,{" "}
              <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-emerald-300 bg-clip-text text-transparent">
                as one intelligent digital world
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/65">
              NEXORA connects departments, communication, knowledge and AI into a single digital
              representation of your organization — so decisions are made with full context, and
              nothing important gets lost between silos.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-900/40 transition-transform hover:scale-[1.02]"
              >
                Create your organization
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-ink-950 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              Built to end departmental silos
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-white/60">
              Bad decisions rarely come from bad people — they come from missing information,
              distorted communication and invisible expertise. NEXORA makes the whole organization
              visible, searchable and intelligent.
            </p>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-brand-400/40 hover:bg-white/[0.07]"
                >
                  <f.icon className="text-brand-300" width={22} height={22} />
                  <h3 className="mt-4 font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              People + Organization + Communication + Knowledge + AI
            </h2>
            <p className="mt-4 text-white/60">
              Turn a collection of disconnected employees into an interconnected digital knowledge
              network.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02]"
            >
              Start now — it&apos;s open source
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-white/40">
          <span>NEXORA</span>
          <span>Apache-2.0 · Built by its community</span>
        </div>
      </footer>
    </div>
  );
}
