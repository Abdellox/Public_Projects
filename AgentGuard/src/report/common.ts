import type { AgentGuardEvent } from "../core/events.js";
import { scoreSession } from "../core/risk.js";
import type { SessionMeta } from "../core/session.js";

export interface ReportData {
  meta: SessionMeta;
  events: AgentGuardEvent[];
}

export function collectReportData(meta: SessionMeta, events: AgentGuardEvent[]): ReportData {
  return { meta, events };
}

function countBy<T>(items: T[], key: (item: T) => string): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

export function summarize(data: ReportData) {
  const commands = data.events.filter((e): e is Extract<AgentGuardEvent, { type: "command" }> => e.type === "command");
  const blocked = commands.filter((c) => c.blocked);
  const approved = commands.filter((c) => c.approvedBy !== null);
  const fileChanges = data.events.filter(
    (e): e is Extract<AgentGuardEvent, { type: "file_change" }> => e.type === "file_change"
  );
  const secrets = data.events.filter(
    (e): e is Extract<AgentGuardEvent, { type: "secret_detected" }> => e.type === "secret_detected"
  );
  const notes = data.events.filter(
    (e): e is Extract<AgentGuardEvent, { type: "note" }> => e.type === "note" && e.level !== "info"
  );
  const score = scoreSession(data.events);
  const durationMs =
    data.meta.endedAt !== null
      ? Math.max(0, new Date(data.meta.endedAt).getTime() - new Date(data.meta.startedAt).getTime())
      : null;
  return {
    commands,
    blocked,
    approved,
    fileChanges,
    secrets,
    warnings: notes,
    score,
    durationMs,
    decisions: countBy(commands, (c) => c.decision),
    changeKinds: countBy(fileChanges, (f) => f.change),
  };
}
