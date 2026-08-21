import type { Decision, RiskLevel } from "./events.js";
import { maxRisk } from "./events.js";
import type { Policy } from "./policy.js";
import { analyzeCommand, type CommandFinding } from "../detectors/commands.js";
import { detectSecrets, redactSecrets, type SecretFinding } from "../detectors/secrets.js";
import { findProtectedPathTokens } from "../detectors/files.js";
import { matchesAnyPattern } from "../util/glob.js";

export interface EngineVerdict {
  decision: Decision;
  risk: RiskLevel;
  reasons: string[];
  ruleIds: string[];
  matchedAskPatterns: string[];
  approvalKeys: string[];
  secretFindings: SecretFinding[];
  redactedCommand: string;
}

export interface EvaluateOptions {
  interactive: boolean;
  sessionApprovals: Set<string>;
}

export function evaluateCommand(
  command: string,
  policy: Policy,
  projectDir: string,
  options: EvaluateOptions
): EngineVerdict {
  const reasons: string[] = [];
  const ruleIds: string[] = [];
  const matchedAskPatterns: string[] = [];
  let risk: RiskLevel = "low";
  let decision: Decision = "allow";

  const { redacted, findings: secretFindings } = redactSecrets(command);

  const commandFindings = analyzeCommand(command);
  for (const f of commandFindings) {
    risk = maxRisk(risk, f.risk);
    reasons.push(f.description);
    ruleIds.push(f.ruleId);
  }

  if (policy.secrets.scan_commands && secretFindings.length > 0) {
    for (const s of secretFindings) {
      reasons.push(`Literal ${s.label} present in the command line`);
      ruleIds.push(s.ruleId);
    }
    risk = maxRisk(risk, "critical");
    if (policy.secrets.block_on_detection) {
      return finish("deny", risk, [...reasons, "Blocked because secrets.block_on_detection is enabled"], ruleIds, matchedAskPatterns, [], secretFindings, redacted);
    }
  }

  const criticalFindings = commandFindings.filter((f) => f.risk === "critical");
  if (criticalFindings.length > 0) {
    return finish("deny", risk, reasons, ruleIds, matchedAskPatterns, [], secretFindings, redacted);
  }

  const denyPattern = matchesAnyPattern(command, policy.permissions.shell.deny);
  if (denyPattern !== null) {
    reasons.push(`Matched deny rule "${denyPattern}"`);
    ruleIds.push(`policy.deny:${denyPattern}`);
    return finish("deny", maxRisk(risk, "high"), reasons, ruleIds, matchedAskPatterns, [], secretFindings, redacted);
  }

  const highFindings = commandFindings.filter((f) => f.risk === "high");
  const protectedTokens = findProtectedPathTokens(command, policy.permissions.filesystem.protected, projectDir);
  for (const t of protectedTokens) {
    reasons.push(`References protected path matching "${t.pattern}"`);
    ruleIds.push(`policy.protected-path:${t.pattern}`);
    risk = maxRisk(risk, "high");
  }

  const askHits: string[] = [];
  const askPattern = matchesAnyPattern(command, policy.permissions.shell.ask);
  if (askPattern !== null) {
    askHits.push(askPattern);
    ruleIds.push(`policy.ask:${askPattern}`);
    reasons.push(`Matched approval rule "${askPattern}"`);
  }
  if (highFindings.length > 0 || protectedTokens.length > 0 || askHits.length > 0) {
    const approvalKeys = [
      ...highFindings.map((f) => f.ruleId),
      ...protectedTokens.map((t) => `path:${t.pattern}`),
      ...askHits.map((p) => `pattern:${p}`),
    ];
    if (approvalKeys.some((k) => options.sessionApprovals.has(k))) {
      return finish("allow_session", risk, reasons, ruleIds, askHits, approvalKeys, secretFindings, redacted);
    }
    if (!options.interactive) {
      return finish(
        "deny",
        risk,
        [...reasons, "Non-interactive session: approval prompts are unavailable, so the action was denied"],
        ruleIds,
        askHits,
        approvalKeys,
        secretFindings,
        redacted
      );
    }
    decision = "allow_once";
    matchedAskPatterns.push(...askHits);
    return finish(decision, risk, reasons, ruleIds, matchedAskPatterns, approvalKeys, secretFindings, redacted);
  }

  const allowPattern = matchesAnyPattern(command, policy.permissions.shell.allow);
  if (allowPattern !== null) {
    ruleIds.push(`policy.allow:${allowPattern}`);
    return finish("allow", risk, reasons, ruleIds, matchedAskPatterns, [], secretFindings, redacted);
  }

  if (policy.permissions.shell.default === "deny") {
    reasons.push('Allowlist mode: permissions.shell.default is "deny" and no allow rule matched');
    return finish("deny", maxRisk(risk, "medium"), reasons, ruleIds, matchedAskPatterns, [], secretFindings, redacted);
  }

  return finish("allow", risk, reasons, ruleIds, matchedAskPatterns, [], secretFindings, redacted);
}

function finish(
  decision: Decision,
  risk: RiskLevel,
  reasons: string[],
  ruleIds: string[],
  matchedAskPatterns: string[],
  approvalKeys: string[],
  secretFindings: SecretFinding[],
  redactedCommand: string
): EngineVerdict {
  return {
    decision,
    risk,
    reasons,
    ruleIds,
    matchedAskPatterns,
    approvalKeys,
    secretFindings,
    redactedCommand,
  };
}
