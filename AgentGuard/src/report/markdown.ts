import type { ReportData } from "./common.js";
import { summarize } from "./common.js";

function esc(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/`/g, "'");
}

export function renderMarkdownReport(data: ReportData): string {
  const s = summarize(data);
  const lines: string[] = [];
  lines.push("# AgentGuard Report");
  lines.push("");
  lines.push(`- **Session:** \`${data.meta.id}\``);
  lines.push(`- **Agent:** ${data.meta.agent}`);
  lines.push(`- **Started:** ${data.meta.startedAt}`);
  lines.push(
    `- **Duration:** ${
      s.durationMs === null ? "in progress" : `${Math.round(s.durationMs / 1000)}s`
    }`
  );
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("| --- | --- |");
  lines.push(`| Commands executed | ${s.commands.length - s.blocked.length} |`);
  lines.push(`| Commands blocked | ${s.blocked.length} |`);
  lines.push(`| Files changed | ${s.fileChanges.length} |`);
  lines.push(`| Secrets detected | ${s.secrets.length} |`);
  lines.push(`| Manually approved actions | ${s.approved.length} |`);
  lines.push("");
  lines.push("## Risk score");
  lines.push("");
  lines.push(`**${s.score.score}/100 (${s.score.level})**`);
  lines.push("");
  if (s.score.contributions.length === 0) {
    lines.push("_No risk contributions recorded._");
  } else {
    lines.push("| Points | Reason |");
    lines.push("| --- | --- |");
    for (const c of s.score.contributions) {
      lines.push(`| +${c.points} | ${esc(c.label)} |`);
    }
  }
  lines.push("");

  if (s.blocked.length > 0) {
    lines.push("## Blocked commands");
    lines.push("");
    for (const b of s.blocked) {
      lines.push(`- \`${esc(b.command)}\``);
      for (const reason of b.reasons) lines.push(`  - ${esc(reason)}`);
    }
    lines.push("");
  }

  const fileChanges = data.events.filter((e) => e.type === "file_change");
  if (fileChanges.length > 0) {
    lines.push("## File changes");
    lines.push("");
    lines.push("| Change | Path | Risk |");
    lines.push("| --- | --- | --- |");
    for (const f of fileChanges) {
      if (f.type !== "file_change") continue;
      lines.push(`| ${f.change} | \`${esc(f.path)}\` | ${f.risk} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
