import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TestCard Lab - Payment Sandbox Testing Tool",
  description:
    "Generate official sandbox/test payment data for Stripe, PayPal, Adyen, and Braintree. Developer tools for checkout flow testing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-800 bg-zinc-950/90">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 font-mono text-sm font-bold text-white">
                TC
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-50">TestCard Lab</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Sandbox testing playground
                </div>
              </div>
            </div>
            <nav className="hidden items-center gap-4 sm:flex">
              <a
                href="/api/test-data?provider=stripe&scenario=declined"
                className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-200"
              >
                /api/test-data
              </a>
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                Sandbox only
              </span>
            </nav>
          </div>
        </header>
        <main className="flex-1 mt-8">{children}</main>
        <footer className="border-t border-zinc-800 bg-zinc-950 py-6">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <p className="text-xs text-zinc-500">
              TestCard Lab generates data exclusively for official payment-provider
              sandbox environments. It does not connect to real payment networks,
              does not generate Luhn-valid cards for production use, and never
              attempts to bypass real checkout/verification systems.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
