"use client";

import { Braces, Eraser, Minimize2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE = `{"name":"DevKit","version":"1.0.0","tools":["json","jwt","regex"],"config":{"theme":"dark","offline":true},"stars":10000}`;

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState("2");

  function run(minify: boolean) {
    if (!input.trim()) {
      setError("Paste some JSON first.");
      setOutput("");
      return;
    }
    try {
      const parsed: unknown = JSON.parse(input);
      const space = indent === "tab" ? "\t" : Number(indent);
      setOutput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, space));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Input</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={indent} onChange={(e) => setIndent(e.target.value)} aria-label="Indent">
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tabs</option>
            </Select>
            <Button size="sm" onClick={() => run(false)}>
              <Sparkles className="size-3.5" /> Format
            </Button>
            <Button size="sm" variant="secondary" onClick={() => run(true)}>
              <Minimize2 className="size-3.5" /> Minify
            </Button>
          </div>
        </div>
        <Textarea
          rows={14}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"hello": "world"}'
          aria-label="JSON input"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {input.length.toLocaleString()} chars · {input ? input.split("\n").length : 0} lines
          </span>
          <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE)}>
            Sample
          </Button>
        </div>
        {error && <ErrorText>{error}</ErrorText>}
      </Panel>

      <Panel className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Output</Label>
          <div className="flex items-center gap-1">
            <CopyButton value={output} />
            <Button size="sm" variant="ghost" onClick={() => { setOutput(""); setError(null); }}>
              <Eraser className="size-3.5" /> Clear
            </Button>
          </div>
        </div>
        {output ? (
          <pre className="max-h-[420px] grow overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {output}
          </pre>
        ) : (
          <div className="flex max-h-[420px] grow flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700">
            <Braces className="size-8 opacity-50" />
            Formatted JSON appears here
          </div>
        )}
      </Panel>
    </div>
  );
}
