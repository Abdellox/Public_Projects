import Reveal from "./Reveal"
import SectionHeading from "./SectionHeading"
import { IconStar } from "./icons"

// PLACEHOLDER TESTIMONIALS — replace `testimonials` below with real customer quotes when available.
// Keep the same shape: { quote, name, role, business, initials }.
const testimonials = [
  {
    quote:
      "We used to count stock by hand every Sunday. Now it takes ten minutes to check everything on my phone. Stockly paid for itself the first month.",
    name: "Placeholder Name 1",
    role: "Owner",
    business: "Boutique clothing store",
    initials: "P1",
  },
  {
    quote:
      "The low-stock alerts alone are worth it. We stopped running out of our best-selling items — customers noticed before we did.",
    name: "Placeholder Name 2",
    role: "Manager",
    business: "Neighborhood grocery store",
    initials: "P2",
  },
  {
    quote:
      "I imported 800 products from Excel during my lunch break. Two years of messy spreadsheets, gone. It really was that simple.",
    name: "Placeholder Name 3",
    role: "Founder",
    business: "Online electronics shop",
    initials: "P3",
  },
]

function Avatar({ initials }) {
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700"
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title={
            <>
              Small businesses <span className="text-emerald-600">run on Stockly</span>
            </>
          }
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-navy-900/5">
                <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, j) => (
                    <IconStar key={j} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-navy-700">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-navy-50 pt-5">
                  <Avatar initials={t.initials} />
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{t.name}</p>
                    <p className="text-xs text-navy-400">
                      {t.role}, {t.business}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
