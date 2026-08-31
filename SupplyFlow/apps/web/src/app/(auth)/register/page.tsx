import { AuthForm } from "@/components/auth-form";
import { Logo } from "../login/page";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="rounded-xl border border-ink-200 bg-white shadow-card p-6">
          <h1 className="text-lg font-semibold tracking-tight text-ink-900">Create your account</h1>
          <p className="mt-1 mb-5 text-[13px] text-ink-500">You&apos;ll set up your organization next.</p>
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  );
}
