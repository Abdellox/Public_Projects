"use client";

import { FileDiff } from "lucide-react";
import { useMemo, useState } from "react";
import { Label, Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

type OpType = "same" | "add" | "del";

interface Op {
  type: OpType;
  text: string;
}

const MAX_LINES = 1500;

function diffLines(a: string[], b: string[]): Op[] {
  const n = a.length;
  const m = b.length;
  const width = m + 1;
  const dp = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * width + j] =
        a[i] === b[j]
          ? dp[(i + 1) * width + j + 1] + 1
          : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
    }
  }
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1]) {
      ops.push({ type: "del", text: a[i] });
      i++;
    } else {
      ops.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: "del", text: a[i] });
    i++;
  }
  while (j < m) {
    ops.push({ type: "add", text: b[j] });
    j++;
  }
  return ops;
}

export default function DiffChecker() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");

  const result = useMemo(() => {
    const a = original.split("\n");
    const b = changed.split("\n");
    if (!original.trim() && !changed.trim()) return null;
    if (a.length > MAX_LINES || b.length > MAX_LINES) return null;
    const ops = diffLines(a, b);
    return {
      ops,
      added: ops.filter((o) => o.type === "add").length,
      removed: ops.filter((o) => o.type === "del").length,
    };
  }, [original, changed]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3">
          <Label>Original</Label>
          <Textarea
            rows={12}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder={"line one\nline two\nline three"}
            aria-label="Original text"
          />
        </Panel>
        <Panel className="flex flex-col gap-3">
          <Label>Changed</Label>
          <Textarea
            rows={12}
            value={changed}
            onChange={(e) => setChanged(e.target.value)}
            placeholder={"line one\nline two modified\nline three\nline four"}
            aria-label="Changed text"
          />
        </Panel>
      </div>

      {result ? (
        <Panel className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Differences</Label>
            <span className="flex items-center gap-3 font-mono text-xs">
              <span className="text-emerald-600 dark:text-emerald-400">+{result.added}</span>
              <span className="text-red-500 dark:text-red-400">−{result.removed}</span>
            </span>
          </div>
          <div className="max-h-[420px] overflow-auto rounded-lg border border-zinc-200 font-mono text-xs leading-relaxed dark:border-zinc-800">
            {result.ops.map((op, i) => (
              <div
                key={i}
                className={`flex gap-2 px-3 py-0.5 whitespace-pre-wrap ${
                  op.type === "add"
                    ? "diff-add"
                    : op.type === "del"
                      ? "diff-del"
                      : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <span className="w-3 shrink-0 select-none opacity-70">
                  {op.type === "add" ? "+" : op.type === "del" ? "−" : " "}
                </span>
                <span>{op.text || " "}</span>
              </div>
            ))}
          </div>
        </Panel>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-10 text-sm text-zinc-400 dark:border-zinc-700">
          <FileDiff className="size-8 opacity-50" />
          Paste text in both boxes to compare
        </div>
      )}
      {result === null && (original.split("\n").length > MAX_LINES || changed.split("\n").length > MAX_LINES) && (
        <p className="text-xs text-zinc-400">
          Diff is limited to {MAX_LINES.toLocaleString()} lines per side.
        </p>
      )}
    </div>
  );
}
