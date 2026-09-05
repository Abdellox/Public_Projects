"use client";

import { Check, Clipboard } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", className }: CopyButtonProps) {
  const { copy, feedback } = useClipboard();

  const isSuccess = feedback.state === "success" && feedback.value === text;

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={`${label} ${text}`}
      title={label}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100",
        isSuccess && "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-300",
        className,
      )}
    >
      {isSuccess ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
      <span>{isSuccess ? "Copied" : label}</span>
    </button>
  );
}
