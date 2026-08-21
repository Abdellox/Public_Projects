"use client";

import { Code } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

const NAMED: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(NAMED).map(([char, entity]) => [entity.slice(1, -1), char])
);

function encodeEntities(text: string): string {
  return text.replace(/[&<>"']/g, (c) => NAMED[c]);
}

function decodeEntities(text: string): string {
  return text.replace(/&(#[xX]?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body: string) => {
    if (body.startsWith("#")) {
      const isHex = body[1] === "x" || body[1] === "X";
      const code = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (Number.isFinite(code) && code >= 0 && code <= 0x10ffff) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }
      return match;
    }
    return REVERSE[body] ?? match;
  });
}

export default function HtmlEntities() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null };
    try {
      return { output: mode === "encode" ? encodeEntities(input) : decodeEntities(input), error: null as string | null };
    } catch {
      return { output: "", error: "Could not process this text." };
    }
  }, [input, mode]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => setMode((m) => (m === "encode" ? "decode" : "encode"))}>
          Switch to {mode === "encode" ? "decode" : "encode"}
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3">
          <Label>{mode === "encode" ? "Raw HTML / text" : "Encoded entities"}</Label>
          <Textarea
            rows={12}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? '<div class="hello">Tom & Jerry</div>'
                : "&lt;div class=&quot;hello&quot;&gt;Tom &amp; Jerry&lt;/div&gt;"
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
              <Code className="size-8 opacity-50" />
              Result appears here
            </div>
          )}
        </Panel>
      </div>
      <p className="text-xs text-zinc-400">
        Encoding escapes &lt; &gt; &amp; &quot; and &apos;. Decoding also resolves numeric
        references like &#38;#169; or &#38;#x2713;.
      </p>
    </div>
  );
}
