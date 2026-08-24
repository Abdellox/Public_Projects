import Reveal from "./Reveal"
import { IconArrowRight } from "./icons"

export default function FinalCta() {
  return (
    <section className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-16 text-center sm:px-12 sm:py-24">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_50%_100%,rgba(16,185,129,0.28),transparent_65%)]"
            />
            <div
              aria-hidden="true"
              className="animate-float-slow pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                Stop guessing what you have in stock.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-navy-200">
                Start managing your inventory the simple way.
              </p>
              <div className="mt-9 flex justify-center">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-400/40 active:translate-y-0"
                >
                  Start for free
                  <IconArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-5 text-sm text-navy-300">Free forever plan · No credit card · Set up in minutes</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
