"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  url?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const openShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-white p-1 shadow-lg">
          <button
            onClick={copyToClipboard}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={() =>
              openShare(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
              )
            }
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <ExternalLink className="h-4 w-4" />
            Twitter
          </button>
          <button
            onClick={() =>
              openShare(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
              )
            }
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <ExternalLink className="h-4 w-4" />
            Facebook
          </button>
          <button
            onClick={() =>
              openShare(
                `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`
              )
            }
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <ExternalLink className="h-4 w-4" />
            WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
