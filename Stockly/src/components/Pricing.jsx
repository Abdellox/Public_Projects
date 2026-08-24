import { useState } from "react"
import Reveal from "./Reveal"
import SectionHeading from "./SectionHeading"
import { IconCheck } from "./icons"

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    tagline: "Everything you need to get started.",
    features: ["Up to 100 products", "Basic inventory", "Stock movements", "Basic dashboard"],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: { monthly: 19, yearly: 15 },
    tagline: "For growing businesses that need more power.",
    popular: true,
    features: [
      "Unlimited products",
      "Barcode scanning",
      "Low-stock alerts",
      "Reports",
      "Excel import/export",
      "Multiple users",
    ],
    cta: "Start 14-day free trial",
  },
  {
    name: "Business",
    price: { monthly: 49, yearly: 39 },
    tagline: "For teams running multiple locations.",
    features: [
      "Everything in Pro",
      "Multiple locations",
      "Advanced reports",
      "Team permissions",
      "Priority support",
    ],
    cta: "Start for free",
  },
]

export default function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="scroll-mt-20 bg-navy-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Simple pricing that <span className="text-emerald-600">grows with you</span>
            </>
          }
          subtitle="Start free. Upgrade only when you need to. No hidden fees, cancel anytime."
        />

        <Reveal className="mt-8 flex justify-center" delay={100}>
          <div className="inline-flex items-center rounded-full border border-navy-200 bg-white p-1 text-sm font-semibold" role="group" aria-label="Billing period">
            {[
              { label: "Monthly", value: false },
              { label: "Yearly · save 20%", value: true },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setYearly(opt.value)}
                aria-pressed={yearly === opt.value}
                className={`rounded-full px-4 py-1.5 transition-all ${
                  yearly === opt.value ? "bg-emerald-600 text-white shadow-sm" : "text-navy-500 hover:text-navy-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100} className={plan.popular ? "lg:-mt-4 lg:mb-[-1rem]" : ""}>
              <article
                className={`relative flex h-full flex-col rounded-2xl p-7 transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-emerald-500 bg-white shadow-xl shadow-emerald-600/10 lg:p-8"
                    : "border border-navy-100 bg-white shadow-sm hover:-translate-y-1 hover:border-navy-200 hover:shadow-lg hover:shadow-navy-900/5"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-bold tracking-wide text-white uppercase shadow-md shadow-emerald-600/30">
                    Most popular
                  </span>
                )}
                <h3 className="text-base font-bold tracking-tight text-navy-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-navy-400">{plan.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
                    ${yearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-sm font-medium text-navy-400">/month</span>
                </div>
                {yearly && plan.price.monthly > 0 && (
                  <p className="mt-1 text-xs font-medium text-emerald-600">Billed annually — ${plan.price.yearly * 12}/year</p>
                )}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-navy-700">
                      <IconCheck className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? "text-emerald-600" : "text-navy-300"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#top"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                    plan.popular
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/35"
                      : "border border-navy-200 bg-white text-navy-800 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {plan.cta}
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <p className="mt-10 text-center text-sm text-navy-400">
            All plans include unlimited stock movements and secure cloud backup. No credit card required to start.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
