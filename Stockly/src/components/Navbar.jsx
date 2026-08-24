import { useEffect, useState } from "react"
import Logo from "./Logo"
import { IconMenu, IconX } from "./icons"

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => (document.body.style.overflow = "")
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-navy-100/80 bg-white/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Stockly home">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight text-navy-900">Stockly</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-900"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 transition-colors hover:text-emerald-700"
          >
            Login
          </a>
          <a
            href="#pricing"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-600/30 active:scale-[0.98]"
          >
            Start for free
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 transition-colors hover:bg-navy-50 md:hidden"
        >
          {open ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={`fixed inset-x-0 top-16 bottom-0 z-40 bg-white transition-all duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 p-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3.5 text-base font-medium text-navy-800 transition-colors hover:bg-navy-50"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#login"
            onClick={() => setOpen(false)}
            className="rounded-xl px-4 py-3.5 text-base font-medium text-navy-800 transition-colors hover:bg-navy-50"
          >
            Login
          </a>
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="mt-3 rounded-xl bg-emerald-600 px-4 py-3.5 text-center text-base font-semibold text-white shadow-sm shadow-emerald-600/25 transition-colors hover:bg-emerald-500"
          >
            Start for free
          </a>
        </div>
      </div>
    </header>
  )
}
