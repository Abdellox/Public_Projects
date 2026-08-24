import { useState } from "react"
import Reveal from "./Reveal"
import SectionHeading from "./SectionHeading"
import { AreaChart, BarChart } from "./Charts"
import {
  IconGrid,
  IconBox,
  IconLayers,
  IconArrows,
  IconTruck,
  IconReport,
  IconGear,
  IconSearch,
  IconBell,
  IconPlus,
} from "./icons"

const navItems = [
  { label: "Dashboard", icon: IconGrid },
  { label: "Products", icon: IconBox },
  { label: "Inventory", icon: IconLayers },
  { label: "Stock Movements", icon: IconArrows },
  { label: "Suppliers", icon: IconTruck },
  { label: "Reports", icon: IconReport },
  { label: "Settings", icon: IconGear },
]

const kpis = [
  { label: "Total Products", value: "1,248", delta: "+4.1% this month" },
  { label: "Stock Value", value: "$84,520", delta: "+2.3% this month" },
  { label: "Low Stock", value: "27", delta: "Needs reorder soon", warn: true },
  { label: "Out of Stock", value: "8", delta: "Action required", danger: true },
]

const lowStockRows = [
  { sku: "TS-BLK-M", name: "Cotton T-Shirt — Black / M", stock: 4, reorder: 15 },
  { sku: "CB-USBC-2M", name: "USB-C Cable 2m", stock: 6, reorder: 20 },
  { sku: "CF-BEAN-1KG", name: "Coffee Beans Arabica 1kg", stock: 3, reorder: 12 },
  { sku: "BT-AAA-4PK", name: "AAA Batteries (4-pack)", stock: 9, reorder: 30 },
]

const activity = [
  { text: "Received +40 Wireless Mouse MX-200", time: "8 min ago", tone: "in" },
  { text: "Sale −12 Cotton T-Shirt Black/M", time: "26 min ago", tone: "out" },
  { text: "Adjustment −2 Ceramic Mug (damaged)", time: "1 h ago", tone: "adj" },
  { text: "Received +120 USB-C Cable 1m", time: "2 h ago", tone: "in" },
  { text: "Low-stock alert: Coffee Beans 1kg", time: "3 h ago", tone: "alert" },
]

function toneClass(tone) {
  if (tone === "in") return "bg-emerald-50 text-emerald-600"
  if (tone === "out") return "bg-orange-50 text-orange-600"
  if (tone === "alert") return "bg-red-50 text-red-500"
  return "bg-navy-50 text-navy-500"
}

export default function DashboardPreview() {
  const [active, setActive] = useState("Dashboard")

  return (
    <section id="dashboard" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Dashboard"
          title={
            <>
              Your whole inventory,{" "}
              <span className="text-emerald-600">one clear view</span>
            </>
          }
          subtitle="Stock levels, movements, and alerts at a glance. This is what simple looks like."
        />

        <Reveal className="relative mt-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-1/3 -z-10 h-96 rounded-[3rem] bg-gradient-to-r from-emerald-200/40 via-teal-100/30 to-emerald-100/40 blur-3xl"
          />
          <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl shadow-navy-900/10 ring-1 ring-navy-900/5">
            <div className="flex min-h-[36rem]">
              {/* Sidebar */}
              <aside className="hidden w-56 shrink-0 flex-col border-r border-navy-100 bg-navy-900 p-4 lg:flex">
                <div className="mb-6 flex items-center gap-2 px-2 pt-2">
                  <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
                    <rect width="32" height="32" rx="8" fill="#059669" />
                    <path d="M9 20.5V13l7-4 7 4v7.5l-7 4-7-4z" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
                    <path d="M9 13l7 4 7-4M16 17v7.5" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
                  </svg>
                  <span className="text-base font-bold text-white">Stockly</span>
                </div>
                <nav className="space-y-1" aria-label="Dashboard preview">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActive(item.label)}
                      aria-current={active === item.label ? "page" : undefined}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active === item.label
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "text-navy-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="mt-auto rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <p className="text-xs font-semibold text-white">Free plan</p>
                  <p className="mt-0.5 text-[11px] text-navy-300">62 of 100 products used</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[62%] rounded-full bg-emerald-500" />
                  </div>
                  <a href="#pricing" className="mt-3 block rounded-lg bg-emerald-600 px-2.5 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-emerald-500">
                    Upgrade to Pro
                  </a>
                </div>
              </aside>

              {/* Main panel */}
              <div className="min-w-0 flex-1 overflow-hidden bg-slate-50/70">
                {/* Top bar */}
                <div className="flex items-center justify-between gap-3 border-b border-navy-100 bg-white px-4 py-3 sm:px-6">
                  <p className="truncate text-base font-bold tracking-tight text-navy-900">{active}</p>
                  <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-2 rounded-lg border border-navy-100 bg-slate-50 px-3 py-1.5 sm:flex">
                      <IconSearch className="h-4 w-4 text-navy-400" />
                      <span className="text-xs text-navy-400">Search products…</span>
                    </div>
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 text-navy-500">
                      <IconBell className="h-4 w-4" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                        3
                      </span>
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                      AM
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-3">
                  {/* KPI cards */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:col-span-3 lg:grid-cols-4">
                    {kpis.map((k) => (
                      <div
                        key={k.label}
                        className="rounded-xl border border-navy-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy-900/5"
                      >
                        <p className="truncate text-xs font-medium text-navy-400">{k.label}</p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-navy-900">{k.value}</p>
                        <p
                          className={`mt-1 text-xs font-medium ${
                            k.danger ? "text-red-500" : k.warn ? "text-orange-500" : "text-emerald-600"
                          }`}
                        >
                          {k.delta}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Inventory value chart */}
                  <div className="rounded-xl border border-navy-100 bg-white p-4 sm:p-5 xl:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-navy-900">Inventory value</p>
                        <p className="mt-0.5 text-xs text-navy-400">Total worth of stock on hand</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">$84,520</span>
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">+12.4%</span>
                      </div>
                    </div>
                    <AreaChart id="dash-area" data={[58, 61, 60, 64, 63, 68, 71, 69, 74, 76, 75, 80]} className="mt-4 h-44 w-full" />
                    <div className="mt-2 flex justify-between text-[10px] font-medium text-navy-300">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Stock movement chart */}
                  <div className="rounded-xl border border-navy-100 bg-white p-4 sm:p-5">
                    <p className="text-sm font-semibold text-navy-900">Stock movements</p>
                    <p className="mt-0.5 text-xs text-navy-400">Units in vs out · last 7 days</p>
                    <div className="mt-4 h-40">
                      <BarChart values={[320, 180, 410, 260, 350, 210, 380]} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} />
                    </div>
                  </div>

                  {/* Low stock table */}
                  <div className="overflow-hidden rounded-xl border border-navy-100 bg-white xl:col-span-2">
                    <div className="flex items-center justify-between px-4 pt-4 sm:px-5">
                      <div>
                        <p className="text-sm font-semibold text-navy-900">Low-stock products</p>
                        <p className="mt-0.5 text-xs text-navy-400">Below your reorder point</p>
                      </div>
                      <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">27 items</span>
                    </div>
                    <table className="mt-3 w-full text-left text-sm">
                      <thead>
                        <tr className="border-y border-navy-100 bg-slate-50/70 text-xs text-navy-400">
                          <th scope="col" className="px-4 py-2.5 font-medium sm:px-5">SKU</th>
                          <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">Product</th>
                          <th scope="col" className="px-4 py-2.5 font-medium">In stock</th>
                          <th scope="col" className="px-4 py-2.5 font-medium">Reorder at</th>
                          <th scope="col" className="px-4 py-2.5 font-medium"><span className="sr-only">Status</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockRows.map((r) => (
                          <tr key={r.sku} className="border-b border-navy-50 last:border-0 transition-colors hover:bg-emerald-50/40">
                            <td className="px-4 py-3 font-mono text-xs font-medium text-navy-700 sm:px-5">{r.sku}</td>
                            <td className="hidden max-w-48 truncate px-4 py-3 text-navy-800 sm:table-cell">{r.name}</td>
                            <td className="px-4 py-3 font-semibold text-red-500">{r.stock}</td>
                            <td className="px-4 py-3 text-navy-400">{r.reorder}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                                Reorder
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Recent activity */}
                  <div className="rounded-xl border border-navy-100 bg-white p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-navy-900">Recent activity</p>
                      <button type="button" className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50" aria-label="Add movement">
                        <IconPlus className="h-4 w-4" />
                      </button>
                    </div>
                    <ul className="mt-4 space-y-4">
                      {activity.map((a) => (
                        <li key={a.text} className="flex items-start gap-3">
                          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.tone === "in" ? "bg-emerald-500" : a.tone === "out" ? "bg-orange-500" : a.tone === "alert" ? "bg-red-500" : "bg-navy-300"}`} aria-hidden="true" />
                          <div>
                            <p className="text-xs leading-relaxed font-medium text-navy-800">{a.text}</p>
                            <p className="mt-0.5 text-[11px] text-navy-300">{a.time}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
