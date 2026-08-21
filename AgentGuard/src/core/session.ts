import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import type { AgentGuardEvent } from "./events.js";

export interface SessionMeta {
  id: string;
  agent: string;
  startedAt: string;
  endedAt: string | null;
  workingDirectory: string;
  policyPath: string | null;
}

export class SessionStore {
  constructor(readonly baseDir: string) {}

  private sessionDir(sessionId: string): string {
    return path.join(this.baseDir, sessionId);
  }

  createSession(agent: string, workingDirectory: string, policyPath: string | null): SessionMeta {
    const id = newSessionId();
    const dir = this.sessionDir(id);
    fs.mkdirSync(dir, { recursive: true });
    const meta: SessionMeta = {
      id,
      agent,
      startedAt: new Date().toISOString(),
      endedAt: null,
      workingDirectory,
      policyPath,
    };
    fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));
    return meta;
  }

  appendEvent(sessionId: string, event: AgentGuardEvent): void {
    const dir = this.sessionDir(sessionId);
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, "events.jsonl"), JSON.stringify(event) + "\n");
  }

  finalizeSession(sessionId: string): void {
    const metaPath = path.join(this.sessionDir(sessionId), "meta.json");
    if (!fs.existsSync(metaPath)) return;
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as SessionMeta;
    meta.endedAt = new Date().toISOString();
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  }

  listSessions(): SessionMeta[] {
    if (!fs.existsSync(this.baseDir)) return [];
    const out: SessionMeta[] = [];
    for (const entry of fs.readdirSync(this.baseDir)) {
      const metaPath = path.join(this.baseDir, entry, "meta.json");
      if (!fs.existsSync(metaPath)) continue;
      try {
        out.push(JSON.parse(fs.readFileSync(metaPath, "utf8")) as SessionMeta);
      } catch {
        continue;
      }
    }
    return out.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  getMeta(sessionId: string): SessionMeta | null {
    const metaPath = path.join(this.sessionDir(sessionId), "meta.json");
    if (!fs.existsSync(metaPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(metaPath, "utf8")) as SessionMeta;
    } catch {
      return null;
    }
  }

  readEvents(sessionId: string): AgentGuardEvent[] {
    const eventsPath = path.join(this.sessionDir(sessionId), "events.jsonl");
    if (!fs.existsSync(eventsPath)) return [];
    const events: AgentGuardEvent[] = [];
    for (const line of fs.readFileSync(eventsPath, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        events.push(JSON.parse(line) as AgentGuardEvent);
      } catch {
        continue;
      }
    }
    return events;
  }
}

export function newSessionId(): string {
  const now = new Date();
  const stamp =
    now.getUTCFullYear() +
    String(now.getUTCMonth() + 1).padStart(2, "0") +
    String(now.getUTCDate()).padStart(2, "0") +
    "_" +
    String(now.getUTCHours()).padStart(2, "0") +
    String(now.getUTCMinutes()).padStart(2, "0") +
    String(now.getUTCSeconds()).padStart(2, "0");
  const rand = crypto.randomBytes(2).toString("hex");
  return `ag_${stamp}_${rand}`;
}

export interface GitFileChange {
  path: string;
  change: "created" | "modified" | "deleted";
}

export function isGitRepo(cwd: string): boolean {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function gitStatusSnapshot(cwd: string): Map<string, string> {
  try {
    const out = execFileSync("git", ["status", "--porcelain"], { cwd, stdio: "pipe" }).toString();
    const map = new Map<string, string>();
    for (const line of out.split("\n")) {
      if (!line.trim()) continue;
      const status = line.slice(0, 2).trim();
      const file = line.slice(3).trim().replace(/^"|"$/g, "");
      map.set(file, status);
    }
    return map;
  } catch {
    return new Map();
  }
}

export function diffSnapshots(before: Map<string, string>, after: Map<string, string>): GitFileChange[] {
  const changes: GitFileChange[] = [];
  for (const [file, status] of after) {
    const prev = before.get(file);
    if (prev === undefined) {
      changes.push({ path: file, change: status === "??" ? "created" : "modified" });
    } else if (prev !== status) {
      changes.push({ path: file, change: "modified" });
    }
  }
  for (const file of before.keys()) {
    if (!after.has(file)) changes.push({ path: file, change: "deleted" });
  }
  return changes;
}
