"use client";

import { AlignLeft, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Label, Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const OPENERS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
];

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function sentence(minWords = 6, maxWords = 14): string {
  const length = minWords + Math.floor(Math.random() * (maxWords - minWords));
  const words = Array.from({ length }, randomWord);
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

function paragraph(): string {
  const count = 3 + Math.floor(Math.random() * 3);
  const parts: string[] = [OPENERS[Math.floor(Math.random() * OPENERS.length)]];
  for (let i = 0; i < count; i++) parts.push(sentence());
  return parts.join(" ");
}

export default function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [output, setOutput] = useState("");

  function generate() {
    const n = Math.max(1, Math.min(100, count));
    if (unit === "paragraphs") {
      setOutput(Array.from({ length: n }, paragraph).join("\n\n"));
    } else if (unit === "sentences") {
      setOutput(Array.from({ length: n }, () => sentence()).join(" "));
    } else {
      setOutput(
        Array.from({ length: n }, (_, i) => (i === 0 ? "Lorem" : randomWord())).join(" ")
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Amount</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-24"
            aria-label="Amount"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Unit</Label>
          <Select
            value={unit}
            onChange={(e) => setUnit(e.target.value as typeof unit)}
            aria-label="Unit"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </Select>
        </div>
        <div className="mb-0.5 flex items-center gap-2">
          <Button size="sm" onClick={generate}>
            <RefreshCw className="size-3.5" /> Generate
          </Button>
          <CopyButton value={output} label="Copy text" />
        </div>
      </Panel>

      {output ? (
        <Panel>
          <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
            {output}
          </p>
        </Panel>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-10 text-sm text-zinc-400 dark:border-zinc-700">
          <AlignLeft className="size-8 opacity-50" />
          Choose an amount and hit Generate
        </div>
      )}
    </div>
  );
}
