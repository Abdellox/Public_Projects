const PALETTE = [
  "bg-brand-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-sky-600",
  "bg-violet-600",
  "bg-teal-600"
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function colorOf(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length] ?? "bg-brand-600";
}

const SIZES = { sm: "size-7 text-[10px]", md: "size-9 text-xs", lg: "size-12 text-sm" };

export function Avatar({
  name,
  url,
  size = "md"
}: {
  name: string;
  url?: string | null;
  size?: keyof typeof SIZES;
}) {
  if (url) {
    // Remote avatars are user-provided URLs; next/image domains cannot be
    // enumerated at build time, so a plain <img> is required here.
    return <img src={url} alt={name} className={`rounded-full object-cover ${SIZES[size]}`} />;
  }
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorOf(name)} ${SIZES[size]}`}
    >
      {initialsOf(name)}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning";
}) {
  const tones = {
    neutral: "bg-ink-100 text-ink-700",
    brand: "bg-brand-50 text-brand-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700"
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
