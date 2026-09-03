export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
