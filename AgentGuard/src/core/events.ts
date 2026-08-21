export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";

export type Decision = "allow" | "deny" | "allow_once" | "allow_session";

export type ApprovalSource = "user_once" | "user_session" | null;

export interface BaseEvent {
  id: string;
  sessionId: string;
  seq: number;
  timestamp: string;
  agent: string;
}

export interface CommandEvent extends BaseEvent {
  type: "command";
  command: string;
  commandSha256: string;
  decision: Decision;
  risk: RiskLevel;
  reasons: string[];
  ruleIds: string[];
  approvedBy: ApprovalSource;
  exitCode: number | null;
  durationMs: number | null;
  blocked: boolean;
}

export interface FileChangeEvent extends BaseEvent {
  type: "file_change";
  path: string;
  change: "created" | "modified" | "deleted";
  risk: RiskLevel;
  reasons: string[];
}

export interface SecretEvent extends BaseEvent {
  type: "secret_detected";
  context: string;
  secretType: string;
  sample: string;
  risk: RiskLevel;
}

export interface NoteEvent extends BaseEvent {
  type: "note";
  level: "info" | "warn" | "error";
  message: string;
}

export interface SessionStartEvent extends BaseEvent {
  type: "session_start";
  workingDirectory: string;
  policyPath: string | null;
}

export interface SessionEndEvent extends BaseEvent {
  type: "session_end";
  exitCode: number | null;
}

export type AgentGuardEvent =
  | CommandEvent
  | FileChangeEvent
  | SecretEvent
  | NoteEvent
  | SessionStartEvent
  | SessionEndEvent;

export type EventInput = DistributiveOmit<
  AgentGuardEvent,
  "id" | "seq" | "sessionId" | "timestamp" | "agent"
>;

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export const RISK_ORDER: Record<RiskLevel, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
}
