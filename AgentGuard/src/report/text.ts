import type { ReportData } from "./common.js";
import { summarize } from "./common.js";

function fmtDuration(ms: number | null): string {
  if (ms === null) return "in progress";
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function check(ok: boolean): string {
  return ok ? "[ok]" : "[!!]";
}

export function renderTextReport(data: ReportData): string {
  const s = summarize(data);
  const lines: string[] = [];
  lines.push("AgentGuard Report");
  lines.push("=================");
  lines.push(`Session:   ${data.meta.id}`);
  lines.push(`Agent:     ${data.meta.agent}`);
  lines.push(`Started:   ${data.meta.startedAt}`);
  lines.push(`Duration:  ${fmtDuration(s.durationMs)}`);
  lines.push("");
  lines.push("Activity");
  lines.push("--------");
  lines.push(`Commands executed: ${s.commands.length - s.blocked.length}`);
  lines.push(`Commands blocked:  ${s.blocked.length}`);
  lines.push(`Files changed:     ${s.fileChanges.length}`);
  for (const [kind, n] of s.changeKinds) lines.push(`  ${kind}: ${n}`);
  lines.push(`Secrets detected:  ${s.secrets.length}`);
  lines.push("");
  lines.push("Security");
  lines.push("--------");
  lines.push(`${check(s.secrets.length === 0)} No secrets exposed in recorded activity`);
  lines.push(
    `${check(!s.commands.some((c) => c.risk === "critical" && !c.blocked))} No critical commands executed`
  );
  if (s.blocked.length > 0) lines.push(`[!!] ${s.blocked.length} blocked command attempt(s)`);
  if (s.approved.length > 0) lines.push(`[~ ] ${s.approved.length} manually approved action(s)`);
  for (const w of s.warnings) lines.push(`[~ ] ${w.message}`);
  lines.push("");
  lines.push("Risk score");
  lines.push("----------");
  lines.push(`Score: ${s.score.score}/100 (${s.score.level})`);
  if (s.score.contributions.length === 0) {
    lines.push("No risk contributions recorded.");
  } else {
    for (const c of s.score.contributions) lines.push(`  +${c.points}  ${c.label}`);
  }
  lines.push("");
  return lines.join("\n");
}
