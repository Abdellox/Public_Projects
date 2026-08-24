import Reveal from "./Reveal"
import { AreaChart } from "./Charts"
import { IconArrowRight, IconStar, IconCheck, IconPlus } from "./icons"

const stats = [
  { label: "Total products", value: "1,248", delta: "+4.1%", up: true },
  { label: "Stock value", value: "$84,520", delta: "+2.3%", up: true },
  { label: "Low stock", value: "27", delta: "-6", warn: true },
  { label: "Out of stock", value: "8", delta: "-3", warn: true },
]

const movements = [
  { name: "Wireless Mouse MX-200", sku: "WM-2201", change: "+40", in: true },
  { name: "Cotton T-Shirt — Black / M", sku: "TS-BLK-M", change: "-12", in: false },
  { name: "USB-C Cable 1m", sku: "CB-USBC-1M", change: "+120", in: true },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.10),transparent_70%)]"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <a
              href="#features"
              className="group inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 py-1 pl-1 pr-3 text-sm font-medium text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
            >
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">New</span>
              Barcode scanning is here
              <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-6xl lg:text-[4.25rem]">
              Know your stock.{" "}
              <span className="relative whitespace-nowrap text-emerald-600">
                Grow your business.
                <svg
                  viewBox="0 0 320 12"
                  fill="none"
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 w-full text-emerald-300"
                  preserveAspectRatio="none"
                >
                  <path d="M2 9C60 3 180 2 318 7" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-navy-500 sm:text-xl">
              Stockly makes inventory management simple. Track products, monitor stock levels, scan barcodes, and know
              exactly what you have — anytime, anywhere.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#pricing"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/35 active:translate-y-0 sm:w-auto"
              >
                Start for free
                <IconArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-7 py-3.5 text-base font-semibold text-navy-800 transition-all hover:-translate-y-0.5 hover:border-navy-300 hover:bg-navy-50 active:translate-y-0 sm:w-auto"
              >
                See how it works
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-navy-400">
              <span className="flex items-center gap-1.5">
                <span className="flex text-amber-400" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <IconStar key={i} />
                  ))}
                </span>
                Loved by small businesses
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-navy-200 sm:block" aria-hidden="true" />
              <span>Free forever plan</span>
              <span className="hidden h-1 w-1 rounded-full bg-navy-200 sm:block" aria-hidden="true" />
              <span>No credit card required</span>
            </p>
          </Reveal>
        </div>

        {/* Dashboard preview */}
        <Reveal delay={280} className="relative mt-16 sm:mt-20">
          <div
            aria-hidden="true"
            className="absolute inset-x-8 top-8 -z-10 h-full rounded-[2rem] bg-gradient-to-br from-emerald-300/40 via-emerald-100/30 to-transparent blur-2xl"
          />
          <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl shadow-navy-900/10 ring-1 ring-navy-900/5">
            <div className="flex items-center gap-2 border-b border-navy-100 bg-navy-50/60 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
              <div className="ml-4 hidden flex-1 items-center sm:flex">
                <div className="rounded-md bg-white px-4 py-1 text-xs text-navy-400 ring-1 ring-navy-100">
                  app.stockly.io/dashboard
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-5 lg:gap-6">
              <div className="lg:col-span-3">
                <div className="mb-4 grid grid-cols-2 gap-3 xl:gap-4">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-navy-100 p-4 transition-shadow hover:shadow-md hover:shadow-navy-900/5"
                    >
                      <p className="truncate text-xs font-medium text-navy-400">{s.label}</p>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">{s.value}</span>
                        <span
                          className={`text-xs font-semibold ${
                            s.warn ? (s.delta.startsWith("-") ? "text-emerald-600" : "text-red-500") : s.up ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {s.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-navy-100 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy-900">Inventory value</p>
                    <p className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Last 12 weeks
                    </p>
                  </div>
                  <AreaChart
                    id="hero-area"
                    data={[52, 55, 54, 58, 62, 60, 66, 64, 70, 74, 71, 78]}
                    className="h-32 w-full"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-2">
                <div className="rounded-xl border border-navy-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy-900">Recent movements</p>
                    <button type="button" className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50" aria-label="Add stock movement">
                      <IconPlus className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="mt-3 space-y-3">
                    {movements.map((m) => (
                      <li key={m.sku} className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            m.in ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                          }`}
                          aria-hidden="true"
                        >
                          {m.in ? (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 19V5m0 0-6 6m6-6 6 6" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 5v14m0 0 6-6m-6 6-6-6" />
                            </svg>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-navy-800">{m.name}</p>
                          <p className="text-xs text-navy-400">{m.sku}</p>
                        </div>
                        <span className={`shrink-0 text-sm font-semibold ${m.in ? "text-emerald-600" : "text-orange-600"}`}>
                          {m.change}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
                  <p className="text-sm font-semibold text-navy-900">All systems in sync</p>
                  <ul className="mt-3 space-y-2.5">
                    {["Stock synced across 3 locations", "Alerts sent before every stockout", "Excel import ready"].map(
                      (item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-navy-500">
                          <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
