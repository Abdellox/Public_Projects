"use client";

import { useCallback, useState } from "react";

export type CopyFeedback =
  | { state: "idle" }
  | { state: "success"; value: string }
  | { state: "error"; value: string };

export function useClipboard(resetMs = 1500) {
  const [feedback, setFeedback] = useState<CopyFeedback>({ state: "idle" });

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setFeedback({ state: "success", value: text });
      } catch {
        setFeedback({ state: "error", value: text });
      }
      window.setTimeout(() => setFeedback({ state: "idle" }), resetMs);
    },
    [resetMs],
  );

  return { copy, feedback };
}
