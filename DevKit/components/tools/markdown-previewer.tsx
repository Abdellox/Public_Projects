"use client";

import { FileText, Wand2 } from "lucide-react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Label, Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE = `# DevKit

A **beautiful** toolbox for developers.

## Features

- 100% client-side
- Privacy first
- Open source

> Paste Markdown on the left, see it rendered here.

\`\`\`js
console.log("hello devkit");
\`\`\`

1. Write docs
2. Preview instantly
3. Ship faster
`;

function emptySubscribe() {
  return () => {};
}

export default function MarkdownPreviewer() {
  const [input, setInput] = useState(SAMPLE);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const html = useMemo(() => {
    if (!mounted) return "";
    try {
      const raw = marked.parse(input, { async: false });
      return DOMPurify.sanitize(raw);
    } catch {
      return "<p>Could not parse Markdown.</p>";
    }
  }, [mounted, input]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Markdown</Label>
          <div className="flex items-center gap-1">
            <CopyButton value={input} />
            <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE)}>
              <Wand2 className="size-3.5" /> Sample
            </Button>
          </div>
        </div>
        <Textarea
          rows={18}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="# Hello world"
          aria-label="Markdown source"
          className="grow"
        />
      </Panel>
      <Panel className="flex flex-col gap-3">
        <Label>Preview</Label>
        <div className="max-h-[520px] grow overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {input.trim() ? (
            <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 text-zinc-400">
              <FileText className="size-8 opacity-50" />
              Start typing Markdown to see the preview
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
