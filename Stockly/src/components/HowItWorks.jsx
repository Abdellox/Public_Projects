import Reveal from "./Reveal"
import SectionHeading from "./SectionHeading"

const steps = [
  {
    num: "01",
    title: "Add your products",
    desc: "Import your existing products or create them manually. Set stock levels, prices, and reorder points in seconds.",
  },
  {
    num: "02",
    title: "Track every movement",
    desc: "Record purchases, sales, returns, and adjustments. Stockly keeps a complete history automatically.",
  },
  {
    num: "03",
    title: "Stay in control",
    desc: "Get alerts and insights so you always know what needs attention — before it costs you money.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-navy-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Up and running in minutes"
          subtitle="Three simple steps between you and inventory you never have to worry about."
        />

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          <span
            aria-hidden="true"
            className="absolute top-10 right-[16%] left-[16%] hidden border-t-2 border-dashed border-navy-200 md:block"
          />
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 120} as="li">
              <div className="relative flex h-full flex-col items-center rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white shadow-lg shadow-emerald-600/30">
                  {step.num}
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
