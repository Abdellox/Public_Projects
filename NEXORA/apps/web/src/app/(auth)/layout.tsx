export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-80 max-w-2xl rounded-full bg-brand-600/25 blur-[120px]"
      />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
