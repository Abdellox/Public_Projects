"use client";

import { useMemo, useState } from "react";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Segment {
  text: string;
  match: boolean;
}

function highlight(text: string, re: RegExp): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m[0].length === 0) continue;
    if (m.index > last) segments.push({ text: text.slice(last, m.index), match: false });
    segments.push({ text: m[0], match: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), match: false });
  return segments;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");

  const { error, regex, matches } = useMemo(() => {
    if (!pattern) return { error: null as string | null, regex: null, matches: [] as RegExpMatchArray[] };
    try {
      const safeFlags = flags.includes("g") ? flags : flags + "g";
      const re = new RegExp(pattern, safeFlags);
      const all = Array.from(testText.matchAll(re));
      return { error: null as string | null, regex: re, matches: all };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Invalid regular expression",
        regex: null,
        matches: [],
      };
    }
  }, [pattern, flags, testText]);

  const segments =
    regex && testText && !error
      ? highlight(testText, new RegExp(pattern, regex.flags))
      : [];

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-col gap-3">
        <Label>Regular expression</Label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg text-zinc-400">/</span>
          <Input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="\\b\\w+@\\w+\\.\\w+\\b"
            className="flex-1 font-mono"
            aria-label="Pattern"
          />
          <span className="font-mono text-lg text-zinc-400">/</span>
          <Input
            value={flags}
            onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))}
            className="w-20 font-mono"
            aria-label="Flags"
          />
        </div>
        <p className="text-xs text-zinc-400">
          Flags: g global · i ignore case · m multiline · s dotall · u unicode · y sticky
        </p>
        {error && <ErrorText>{error}</ErrorText>}
      </Panel>

      <Panel className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Test string</Label>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              matches.length > 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {matches.length} match{matches.length === 1 ? "" : "es"}
          </span>
        </div>
        <Textarea
          rows={8}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Paste the text you want to test against..."
          aria-label="Test string"
        />
        {segments.length > 0 && (
          <div className="max-h-64 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-950">
            {segments.map((s, i) =>
              s.match ? (
                <mark
                  key={i}
                  className="rounded bg-indigo-200/70 px-0.5 text-indigo-900 dark:bg-indigo-500/40 dark:text-indigo-100"
                >
                  {s.text}
                </mark>
              ) : (
                <span key={i}>{s.text}</span>
              )
            )}
          </div>
        )}
      </Panel>

      {matches.length > 0 && (
        <Panel className="flex flex-col gap-2">
          <Label>Match details</Label>
          <ul className="flex max-h-56 flex-col gap-1.5 overflow-auto font-mono text-xs">
            {matches.map((m, i) => (
              <li
                key={i}
                className="flex flex-wrap items-baseline gap-x-3 rounded-lg border border-zinc-200 px-3 py-1.5 dark:border-zinc-800"
              >
                <span className="text-zinc-400">#{i + 1}</span>
                <span className="text-indigo-600 dark:text-indigo-300">{m[0]}</span>
                <span className="text-zinc-400">at index {m.index}</span>
                {m.slice(1).map((group, gi) => (
                  <span key={gi} className="text-zinc-500 dark:text-zinc-400">
                    ${gi + 1}={group === undefined ? "∅" : group}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
