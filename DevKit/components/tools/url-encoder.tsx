"use client";

import { ArrowLeftRight, Link2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

export default function UrlEncoder() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [component, setComponent] = useState(true);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null };
    try {
      const result =
        mode === "encode"
          ? component
            ? encodeURIComponent(input)
            : encodeURI(input)
          : component
            ? decodeURIComponent(input)
            : decodeURI(input);
      return { output: result, error: null as string | null };
    } catch {
      return { output: "", error: "Malformed input — check for stray % sequences." };
    }
  }, [input, mode, component]);

  function toggle() {
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" variant="ghost" onClick={toggle}>
          <ArrowLeftRight className="size-3.5" /> Switch to{" "}
          {mode === "encode" ? "decode" : "encode"}
        </Button>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={component}
            onChange={(e) => setComponent(e.target.checked)}
            className="size-3.5 accent-indigo-600"
          />
          Component mode (escapes &amp;, =, ? etc.)
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3">
          <Label>{mode === "encode" ? "URL / text" : "Encoded URL"}</Label>
          <Textarea
            rows={12}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "https://example.com/search?q=hello world&lang=en"
                : "https://example.com/search?q=hello%20world&lang=en"
            }
            aria-label="Input"
          />
          {error && <ErrorText>{error}</ErrorText>}
        </Panel>
        <Panel className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Result</Label>
            <CopyButton value={output} />
          </div>
          {output ? (
            <pre className="max-h-[320px] grow overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm leading-relaxed break-all whitespace-pre-wrap text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {output}
            </pre>
          ) : (
            <div className="flex max-h-[320px] grow flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700">
              <Link2 className="size-8 opacity-50" />
              Result appears here
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
