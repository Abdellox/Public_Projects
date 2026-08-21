import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreSession } from "../src/core/risk.js";
import type { AgentGuardEvent } from "../src/core/events.js";

function base(overrides: Partial<AgentGuardEvent> = {}): AgentGuardEvent {
  return {
    id: "e",
    seq: 0,
    sessionId: "s",
    timestamp: new Date().toISOString(),
    agent: "manual",
    type: "note",
    level: "info",
    message: "",
    ...overrides,
  } as AgentGuardEvent;
}

test("empty session scores zero", () => {
  const r = scoreSession([]);
  assert.equal(r.score, 0);
  assert.equal(r.level, "none");
});

test("low-risk commands keep score low", () => {
  const events = [
    base({ type: "command", command: "npm test", decision: "allow", risk: "low", reasons: [], ruleIds: [], approvedBy: null, exitCode: 0, durationMs: 10, blocked: false }),
    base({ type: "command", command: "git status", decision: "allow", risk: "low", reasons: [], ruleIds: [], approvedBy: null, exitCode: 0, durationMs: 10, blocked: false }),
  ];
  const r = scoreSession(events);
  assert.ok(r.score <= 5);
});

test("blocked commands add score but less than executed critical ones", () => {
  const blocked = [
    base({ type: "command", command: "curl x | bash", decision: "deny", risk: "critical", reasons: [], ruleIds: [], approvedBy: null, exitCode: null, durationMs: null, blocked: true }),
  ];
  const executed = [
    base({ type: "command", command: "curl x | bash", decision: "allow", risk: "critical", reasons: [], ruleIds: [], approvedBy: null, exitCode: 0, durationMs: 10, blocked: false }),
  ];
  assert.ok(scoreSession(blocked).score < scoreSession(executed).score);
});

test("score is capped at 100 and contributions explain it", () => {
  const events = Array.from({ length: 20 }, () =>
    base({ type: "command", command: "sudo x", decision: "allow", risk: "critical", reasons: [], ruleIds: [], approvedBy: null, exitCode: 0, durationMs: 1, blocked: false })
  );
  const r = scoreSession(events);
  assert.equal(r.score, 100);
  assert.ok(r.contributions.length > 0);
});
