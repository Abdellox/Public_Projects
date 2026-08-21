"use client";

import { CalendarClock } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";

interface FieldSet {
  values: number[];
  full: boolean;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const RANGES: Array<{ min: number; max: number }> = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12 },
  { min: 0, max: 6 },
];

function parseField(expr: string, index: number): FieldSet | null {
  const { min, max } = RANGES[index];
  const values = new Set<number>();
  for (const part of expr.split(",")) {
    const [rangePart, stepPart] = part.split("/");
    const step = stepPart === undefined ? 1 : Number(stepPart);
    if (!Number.isInteger(step) || step < 1) return null;
    let lo: number;
    let hi: number;
    if (rangePart === "*") {
      lo = min;
      hi = max;
    } else if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-").map(Number);
      lo = a;
      hi = b;
    } else {
      lo = Number(rangePart);
      hi = stepPart !== undefined ? max : lo;
    }
    if (!Number.isInteger(lo) || !Number.isInteger(hi)) return null;
    if (index === 4 && hi === 7) hi = 0;
    if (lo < min || hi > max || lo > hi) return null;
    for (let v = lo; v <= hi; v += step) values.add(v === 7 && index === 4 ? 0 : v);
  }
  return { values: [...values].sort((a, b) => a - b), full: values.size === max - min + 1 };
}

function parseCron(expr: string): Array<FieldSet> | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const sets: Array<FieldSet | null> = parts.map((p, i) => parseField(p, i));
  if (sets.some((s) => s === null)) return null;
  return sets as Array<FieldSet>;
}

function listLabel(values: number[], full: boolean, names?: string[]): string {
  if (full) return "";
  if (names) return values.map((v) => names[v]).join(", ");
  return values.join(", ");
}

function describe(sets: Array<FieldSet>): string {
  const [min, hour, dom, month, dow] = sets;

  let time: string;
  const minStepped = !min.full && min.values.length > 1 && isStepped(min.values);
  const hourStepped = !hour.full && hour.values.length > 1 && isStepped(hour.values);
  if (min.full && hour.full) time = "Every minute";
  else if (min.values.length === 1 && hour.full) time = `At minute ${min.values[0]} past every hour`;
  else if (hour.values.length === 1 && min.full) time = `Every minute during the ${pad(hour.values[0])}:00 hour`;
  else if (min.values.length === 1 && hour.values.length === 1) time = `At ${pad(hour.values[0])}:${pad(min.values[0])}`;
  else if (minStepped && hour.full) time = `Every ${min.values[1] - min.values[0]} minutes`;
  else if (hourStepped && min.full) time = `Every ${hour.values[1] - hour.values[0]} hours`;
  else if (minStepped && hour.values.length === 1) time = `Every ${min.values[1] - min.values[0]} minutes past ${pad(hour.values[0])}:00`;
  else time = `At minute ${listLabel(min.values, false)} past hour ${listLabel(hour.values, false)}`;

  const clauses: string[] = [];
  const domR = !dom.full;
  const dowR = !dow.full;
  if (domR && dowR) {
    clauses.push(`on day-of-month ${listLabel(dom.values, false)} or ${dowR ? listLabel(dow.values, false, WEEKDAYS).toLowerCase() : ""}`);
  } else {
    if (domR) clauses.push(`on day-of-month ${listLabel(dom.values, false)}`);
    if (dowR) clauses.push(`on ${listLabel(dow.values, false, WEEKDAYS).toLowerCase()}`);
  }
  if (!month.full) clauses.push(`in ${listLabel(month.values, false, MONTHS).toLowerCase()}`);

  return [time, ...clauses].join(", ") + ".";
}

function isStepped(values: number[]): boolean {
  if (values.length < 2) return false;
  const step = values[1] - values[0];
  if (step <= 1) return false;
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i - 1] !== step) return false;
  }
  return true;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function nextRuns(sets: Array<FieldSet>, count: number): Date[] {
  const [min, hour, dom, month, dow] = sets;
  const results: Date[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  const startMs = cursor.getTime();

  for (let d = 0; d < 1100 && results.length < count; d++) {
    if (!month.values.includes(cursor.getMonth() + 1)) {
      cursor.setDate(cursor.getDate() + 1);
      continue;
    }
    const domOk = dom.values.includes(cursor.getDate());
    const dowOk = dow.values.includes(cursor.getDay());
    const dayMatch = !dom.full && !dow.full ? domOk || dowOk : domOk && dowOk;
    if (dayMatch) {
      for (const h of hour.values) {
        for (const m of min.values) {
          const t = new Date(cursor);
          t.setHours(h, m, 0, 0);
          if (t.getTime() >= startMs) {
            results.push(t);
            if (results.length >= count) break;
          }
        }
        if (results.length >= count) break;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 15 min", value: "*/15 * * * *" },
  { label: "Daily 09:00", value: "0 9 * * *" },
  { label: "Weekdays 08:30", value: "30 8 * * 1-5" },
  { label: "1st & 15th, 03:30", value: "30 3 1,15 * *" },
];

export default function CronParser() {
  const [expr, setExpr] = useState("*/15 * * * *");

  const parsed = useMemo(() => parseCron(expr), [expr]);

  const next = useMemo(() => (parsed ? nextRuns(parsed, 5) : []), [parsed]);

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-col gap-3">
        <Label>Cron expression (minute · hour · day-of-month · month · day-of-week)</Label>
        <Input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="*/15 * * * *"
          className="font-mono text-lg"
          aria-label="Cron expression"
        />
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button key={p.value} size="sm" variant="secondary" onClick={() => setExpr(p.value)}>
              {p.label}
            </Button>
          ))}
        </div>
        {!parsed && expr.trim() && (
          <ErrorText>
            Invalid cron expression. Use five space-separated fields supporting * , - / and
            numbers (0-59 min, 0-23 hour, 1-31 day, 1-12 month, 0-6 weekday).
          </ErrorText>
        )}
      </Panel>

      {parsed && (
        <>
          <Panel className="flex items-start gap-3 border-indigo-300/50 bg-indigo-50/60 dark:border-indigo-500/25 dark:bg-indigo-500/10">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{describe(parsed)}</p>
          </Panel>

          <Panel className="flex flex-col gap-2">
            <Label>Next 5 runs (local time)</Label>
            <ul className="flex flex-col gap-1.5 font-mono text-sm">
              {next.map((d, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                >
                  <span className="text-zinc-700 dark:text-zinc-200">{d.toLocaleString()}</span>
                  <span className="text-xs text-zinc-400">in {relativeIn(d)}</span>
                </li>
              ))}
              {next.length === 0 && <li className="text-zinc-400">No upcoming runs found within ~3 years.</li>}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}

function relativeIn(date: Date): string {
  const diff = date.getTime() - Date.now();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.round(hours / 24)} days`;
}
