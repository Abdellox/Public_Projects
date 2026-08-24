import Logo from "./Logo"

const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Dashboard", "Barcode scanning", "Integrations"],
  },
  {
    title: "Resources",
    links: ["Help center", "Import guide", "Blog", "API docs", "Community"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press kit"],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-white" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#top" className="inline-flex items-center gap-2.5" aria-label="Stockly home">
              <Logo className="h-8 w-8" />
              <span className="text-lg font-bold tracking-tight text-navy-900">Stockly</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-500">
              Simple inventory management for growing businesses.
            </p>
            <a
              href="#pricing"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              Start for free
            </a>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold tracking-wide text-navy-900 uppercase">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#top" className="text-sm text-navy-500 transition-colors hover:text-emerald-700">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-navy-100 pt-8 sm:flex-row">
          <p className="text-sm text-navy-400">© {new Date().getFullYear()} Stockly. All rights reserved.</p>
          <ul className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <li key={l}>
                <a href="#top" className="text-sm text-navy-400 transition-colors hover:text-emerald-700">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
