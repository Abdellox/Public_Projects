"use client";

import {
  Braces,
  FileCode2,
  FileJson,
  FileSpreadsheet,
  TerminalSquare,
} from "lucide-react";
import type { GeneratedTestData } from "@/core/types";
import {
  makeFilename,
  toCsv,
  toCypressExample,
  toJson,
  toJsFixture,
  toPlaywrightExample,
  toTsFixture,
} from "@/core/exporters";
import { CopyButton } from "./copy-button";

interface DeveloperToolsProps {
  data: GeneratedTestData;
}

export function DeveloperTools({ data }: DeveloperToolsProps) {
  const json = toJson(data);
  const csv = toCsv(data);
  const jsFixture = toJsFixture(data);
  const tsFixture = toTsFixture(data);
  const playwright = toPlaywrightExample(data);
  const cypress = toCypressExample(data);

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Developer tools</h2>
          <p className="text-xs text-zinc-500">
            Copy fixtures or export for your test suite.
          </p>
        </div>
        <Braces className="h-5 w-5 text-zinc-500" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <FileJson className="h-3.5 w-3.5" /> JSON
          </div>
          <div className="flex flex-wrap gap-1.5">
            <CopyButton text={json} label="Copy JSON" className="flex-1" />
            <button
              type="button"
              onClick={() => download(json, makeFilename(data, "json"), "application/json")}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              Download
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
          </div>
          <div className="flex flex-wrap gap-1.5">
            <CopyButton text={csv} label="Copy CSV" className="flex-1" />
            <button
              type="button"
              onClick={() => download(csv, makeFilename(data, "csv"), "text/csv")}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              Download
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <FileCode2 className="h-3.5 w-3.5" /> TS fixture
          </div>
          <div className="flex flex-wrap gap-1.5">
            <CopyButton text={tsFixture} label="Copy TS" className="flex-1" />
            <CopyButton text={jsFixture} label="Copy JS" className="flex-1" />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <TerminalSquare className="h-3.5 w-3.5" /> Playwright
          </div>
          <CopyButton text={playwright} label="Copy Playwright" className="w-full" />
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <TerminalSquare className="h-3.5 w-3.5" /> Cypress
          </div>
          <CopyButton text={cypress} label="Copy Cypress" className="w-full" />
        </div>
      </div>
    </div>
  );
}
