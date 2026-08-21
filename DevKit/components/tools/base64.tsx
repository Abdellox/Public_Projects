"use client";

import { ArrowLeftRight, Binary } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function decodeBase64(text: string): string {
  const binary = atob(text.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null };
    try {
      const result = mode === "encode" ? encodeBase64(input) : decodeBase64(input);
      return { output: result, error: null as string | null };
    } catch {
      return { output: "", error: "That doesn't look like valid Base64." };
    }
  }, [input, mode]);

  function toggle() {
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        <Button size="sm" variant="ghost" onClick={toggle}>
          <ArrowLeftRight className="size-3.5" /> Switch to{" "}
          {mode === "encode" ? "decode" : "encode"}
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3">
          <Label>{mode === "encode" ? "Plain text" : "Base64"}</Label>
          <Textarea
            rows={12}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Hello, DevKit!" : "SGVsbG8sIERldktpdCE="}
            aria-label="Input"
          />
          {error && <ErrorText>{error}</ErrorText>}
        </Panel>
        <Panel className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Base64" : "Plain text"}</Label>
            <CopyButton value={output} />
          </div>
          {output ? (
            <pre className="max-h-[320px] grow overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm leading-relaxed break-all whitespace-pre-wrap text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {output}
            </pre>
          ) : (
            <div className="flex max-h-[320px] grow flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700">
              <Binary className="size-8 opacity-50" />
              Result appears here
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
