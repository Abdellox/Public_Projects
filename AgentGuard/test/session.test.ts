import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SessionStore, diffSnapshots, newSessionId } from "../src/core/session.js";
import type { AgentGuardEvent } from "../src/core/events.js";

function tmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ag-store-"));
}

function noteEvent(seq: number): AgentGuardEvent {
  return {
    id: `id-${seq}`,
    seq,
    sessionId: "s",
    timestamp: new Date().toISOString(),
    agent: "manual",
    type: "note",
    level: "info",
    message: `event ${seq}`,
  };
}

test("create, append, read back", () => {
  const store = new SessionStore(tmp());
  const meta = store.createSession("manual", process.cwd(), null);
  store.appendEvent(meta.id, noteEvent(0));
  store.appendEvent(meta.id, noteEvent(1));
  store.finalizeSession(meta.id);
  assert.equal(store.readEvents(meta.id).length, 2);
  assert.ok(store.getMeta(meta.id)!.endedAt !== null);
  assert.equal(store.listSessions().length, 1);
});

test("session ids are unique and prefixed", () => {
  const a = newSessionId();
  const b = newSessionId();
  assert.notEqual(a, b);
  assert.ok(a.startsWith("ag_"));
});

test("diffSnapshots classifies created/modified/deleted", () => {
  const before = new Map([
    ["a.txt", "M"],
    ["b.txt", "??"],
    ["c.txt", ""],
  ]);
  const after = new Map([
    ["a.txt", "??"],
    ["b.txt", "??"],
    ["d.txt", "??"],
  ]);
  const changes = diffSnapshots(before, after);
  assert.ok(changes.some((c) => c.path === "d.txt" && c.change === "created"));
  assert.ok(changes.some((c) => c.path === "c.txt" && c.change === "deleted"));
});
