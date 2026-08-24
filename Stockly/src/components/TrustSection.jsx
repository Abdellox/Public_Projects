import Reveal from "./Reveal"

const categories = ["Retail", "Clothing", "Grocery", "Electronics", "Ecommerce"]

export default function TrustSection() {
  return (
    <section aria-label="Who uses Stockly" className="border-y border-navy-100 bg-navy-50/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-medium tracking-wide text-navy-400 uppercase">
            Built for businesses that want inventory to just work.
          </p>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-8">
            {categories.map((c) => (
              <li key={c} className="flex items-center gap-x-4 sm:gap-x-8">
                <span className="text-base font-semibold tracking-tight text-navy-700 transition-colors hover:text-emerald-600 sm:text-lg">
                  {c}
                </span>
                {c !== categories[categories.length - 1] && (
                  <span className="h-1.5 w-1.5 rounded-full bg-navy-200" aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
