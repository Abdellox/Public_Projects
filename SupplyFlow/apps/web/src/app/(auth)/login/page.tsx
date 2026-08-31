import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Logo />
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink-900">Welcome back</h1>
          <p className="mt-1 mb-6 text-[14px] text-ink-500">Sign in to your supply-chain workspace.</p>
          <AuthForm mode="login" />
        </div>
      </div>
      <HeroPanel />
    </main>
  );
}

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white font-bold text-[15px]">S</span>
      <span className="text-[17px] font-semibold tracking-tight text-ink-900">SupplyFlow</span>
    </Link>
  );
}

function HeroPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-brand-950 text-white p-12">
      <blockquote className="max-w-md mt-auto mb-auto space-y-6">
        <p className="text-[26px] leading-snug font-medium text-brand-50">
          &ldquo;All our supply-chain data — connected, understandable, and actionable.&rdquo;
        </p>
        <ul className="space-y-3 text-[14px] text-brand-200/90">
          <li>▸ Replace scattered spreadsheets with connected tables</li>
          <li>▸ See stock risks and reorder needs before they bite</li>
          <li>▸ Track every purchase, shipment, and delivery in one place</li>
        </ul>
      </blockquote>
      <p className="text-[13px] text-brand-300/70">Plan better. Stock smarter. Deliver on time.</p>
    </div>
  );
}
