import type { AgentGuardEvent, RiskLevel } from "./events.js";

const COMMAND_RISK_WEIGHT: Record<RiskLevel, number> = {
  none: 0,
  low: 1,
  medium: 6,
  high: 18,
  critical: 40,
};

export interface ScoreContribution {
  label: string;
  points: number;
}

export interface RiskScore {
  score: number;
  level: RiskLevel;
  contributions: ScoreContribution[];
}

export function scoreSession(events: AgentGuardEvent[]): RiskScore {
  const contributions: ScoreContribution[] = [];
  let total = 0;

  const commands = events.filter((e): e is Extract<AgentGuardEvent, { type: "command" }> => e.type === "command");
  const riskCounts = new Map<RiskLevel, number>();
  for (const cmd of commands) {
    if (cmd.blocked) continue;
    riskCounts.set(cmd.risk, (riskCounts.get(cmd.risk) ?? 0) + 1);
  }
  for (const [level, count] of [...riskCounts.entries()].sort((a, b) => b[0].localeCompare(a[0]))) {
    if (count === 0 || COMMAND_RISK_WEIGHT[level] === 0) continue;
    const points = COMMAND_RISK_WEIGHT[level] * count;
    contributions.push({ label: `${count} executed ${level}-risk command${count > 1 ? "s" : ""}`, points });
    total += points;
  }

  const blocked = commands.filter((c) => c.blocked);
  if (blocked.length > 0) {
    const points = Math.min(blocked.length * 10, 30);
    contributions.push({ label: `${blocked.length} blocked command${blocked.length > 1 ? "s" : ""} (attempted)`, points });
    total += points;
  }

  const secrets = events.filter((e): e is Extract<AgentGuardEvent, { type: "secret_detected" }> => e.type === "secret_detected");
  if (secrets.length > 0) {
    const points = Math.min(secrets.length * 15, 45);
    contributions.push({ label: `${secrets.length} secret${secrets.length > 1 ? "s" : ""} detected in activity`, points });
    total += points;
  }

  const fileChanges = events.filter((e): e is Extract<AgentGuardEvent, { type: "file_change" }> => e.type === "file_change");
  const protectedChanges = fileChanges.filter((f) => f.risk === "high" || f.risk === "critical");
  if (protectedChanges.length > 0) {
    const points = Math.min(protectedChanges.length * 10, 30);
    contributions.push({ label: `${protectedChanges.length} change(s) to protected files`, points });
    total += points;
  }
  const mediumChanges = fileChanges.filter((f) => f.risk === "medium").length;
  if (mediumChanges > 0) {
    const points = Math.min(mediumChanges * 2, 12);
    contributions.push({ label: `${mediumChanges} medium-risk file change(s)`, points });
    total += points;
  }

  const score = Math.max(0, Math.min(100, Math.round(total)));
  return { score, level: scoreToLevel(score), contributions };
}

export function scoreToLevel(score: number): RiskLevel {
  if (score >= 70) return "critical";
  if (score >= 40) return "high";
  if (score >= 15) return "medium";
  if (score > 0) return "low";
  return "none";
}
