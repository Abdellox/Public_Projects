import { useState } from "react"
import Reveal from "./Reveal"
import SectionHeading from "./SectionHeading"
import { IconPlus } from "./icons"

const faqs = [
  {
    q: "What is Stockly?",
    a: "Stockly is a simple inventory and stock management platform for small and medium-sized businesses. It helps you track products, monitor stock levels, record movements, and get alerts — so you always know exactly what you have.",
  },
  {
    q: "Can I import my existing Excel inventory?",
    a: "Yes. Upload your spreadsheet and our import wizard maps your columns automatically. Most businesses move their full inventory into Stockly in under ten minutes.",
  },
  {
    q: "Does Stockly work on mobile?",
    a: "Absolutely. Stockly works on any phone, tablet, or computer through your browser — including barcode scanning using your phone's camera.",
  },
  {
    q: "Can multiple employees use it?",
    a: "Yes. On the Pro plan and above you can invite your team, and the Business plan adds granular permissions so everyone sees exactly what they need.",
  },
  {
    q: "Can I manage multiple stores?",
    a: "Yes. The Business plan supports multiple locations — track separate stock levels per store or warehouse while seeing everything in one dashboard.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Of course. There are no contracts and no lock-in. You can downgrade to the free plan or cancel from your settings in two clicks.",
  },
]

function FaqItem({ item, open, onToggle }) {
  return (
    <div className={`rounded-xl border transition-colors duration-200 ${open ? "border-emerald-200 bg-emerald-50/40" : "border-navy-100 bg-white hover:border-navy-200"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-base font-semibold text-navy-900">{item.q}</span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            open ? "rotate-45 bg-emerald-600 text-white" : "bg-navy-50 text-navy-500"
          }`}
          aria-hidden="true"
        >
          <IconPlus className="h-4 w-4" />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-navy-500">{item.a}</p>
        </div>
      </div>
    </div>
  )
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="scroll-mt-20 bg-navy-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <Reveal className="lg:col-span-2">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                align="left"
                eyebrow="FAQ"
                title={
                  <>
                    Questions? <span className="text-emerald-600">Answers.</span>
                  </>
                }
                subtitle="Everything you need to know about getting started with Stockly. Can't find what you're looking for?"
              />
              <a
                href="#contact"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-600"
              >
                Talk to us →
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-3">
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <FaqItem key={f.q} item={f} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
