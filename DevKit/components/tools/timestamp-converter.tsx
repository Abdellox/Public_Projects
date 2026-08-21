"use client";

import { useState, useSyncExternalStore } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";

function subscribeClock(onChange: () => void) {
  const timer = window.setInterval(onChange, 1000);
  return () => window.clearInterval(timer);
}

function getNowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function getServerNow(): number {
  return 0;
}

function parseTimestamp(raw: string): Date | null {
  if (!raw.trim()) return null;
  const n = Number(raw.trim());
  if (!Number.isFinite(n)) return null;
  const ms = Math.abs(n) > 1e11 ? n : n * 1000;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function TimestampConverter() {
  const now = useSyncExternalStore(subscribeClock, getNowSeconds, getServerNow);
  const [unixInput, setUnixInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const parsedDate = parseTimestamp(unixInput);
  const unixError = unixInput.trim() && !parsedDate ? "Not a valid Unix timestamp." : null;

  let localValue = "";
  let epochSeconds = "";
  if (dateInput) {
    const d = new Date(dateInput);
    if (!Number.isNaN(d.getTime())) {
      const pad = (x: number) => String(x).padStart(2, "0");
      localValue = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      epochSeconds = String(Math.floor(d.getTime() / 1000));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Label>Current Unix time</Label>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-indigo-600 tabular-nums dark:text-indigo-400">
            {now === 0 ? "…" : now}
          </p>
        </div>
        <CopyButton value={now === 0 ? "" : String(now)} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3">
          <Label>Unix timestamp → date</Label>
          <Input
            value={unixInput}
            onChange={(e) => setUnixInput(e.target.value)}
            placeholder="1755772800 (seconds or milliseconds)"
            className="font-mono"
            aria-label="Unix timestamp"
          />
          {unixError && <ErrorText>{unixError}</ErrorText>}
          {parsedDate && (
            <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <Row k="Local" v={parsedDate.toLocaleString()} />
              <Row k="UTC" v={parsedDate.toUTCString()} />
              <Row k="ISO 8601" v={parsedDate.toISOString()} />
              <Row k="Relative" v={relative(parsedDate)} />
            </div>
          )}
        </Panel>

        <Panel className="flex flex-col gap-3">
          <Label>Date → Unix timestamp</Label>
          <Input
            type="datetime-local"
            step="1"
            value={localValue}
            onChange={(e) => setDateInput(e.target.value)}
            aria-label="Pick a date"
          />
          {epochSeconds && (
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <span className="font-mono text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                {epochSeconds}
              </span>
              <CopyButton value={epochSeconds} />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-xs font-medium text-zinc-400">{k}</span>
      <span className="text-right font-mono text-xs break-all text-zinc-700 dark:text-zinc-200">
        {v}
      </span>
    </div>
  );
}

function relative(date: Date): string {
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536e6],
    ["month", 2592e6],
    ["day", 864e5],
    ["hour", 36e5],
    ["minute", 6e4],
    ["second", 1000],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "second") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "";
}
