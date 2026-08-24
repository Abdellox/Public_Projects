import Reveal from "./Reveal"
import SectionHeading from "./SectionHeading"
import {
  IconBox,
  IconScan,
  IconBell,
  IconArrows,
  IconTag,
  IconChart,
  IconUpload,
  IconPin,
} from "./icons"

const features = [
  {
    icon: IconBox,
    title: "Real-time inventory",
    desc: "Know exactly how much stock you have — every unit, always up to date.",
  },
  {
    icon: IconScan,
    title: "Barcode scanning",
    desc: "Scan products using your phone or barcode scanner. No extra hardware needed.",
  },
  {
    icon: IconBell,
    title: "Low-stock alerts",
    desc: "Get notified before you run out of important products.",
  },
  {
    icon: IconArrows,
    title: "Stock movements",
    desc: "Track every stock-in and stock-out transaction with a full audit trail.",
  },
  {
    icon: IconTag,
    title: "Product management",
    desc: "Manage SKUs, prices, categories, suppliers, and product images in one place.",
  },
  {
    icon: IconChart,
    title: "Reports",
    desc: "Understand your inventory with simple, useful reports you'll actually read.",
  },
  {
    icon: IconUpload,
    title: "Import from Excel",
    desc: "Move your existing inventory into Stockly in minutes — not weeks.",
  },
  {
    icon: IconPin,
    title: "Multi-location",
    desc: "Manage inventory across multiple stores or warehouses from one account.",
  },
]

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need to{" "}
              <span className="text-emerald-600">stay on top of stock</span>
            </>
          }
          subtitle="No spreadsheets. No guesswork. Just the tools that keep your shelves full and your customers happy."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 80}>
              <article className="group h-full rounded-2xl border border-navy-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-navy-900/5">
                <div className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-navy-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{f.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
