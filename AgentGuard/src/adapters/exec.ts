import { spawn } from "node:child_process";
import crypto from "node:crypto";
import type { AgentAdapter } from "./types.js";
import { evaluateCommand } from "../core/engine.js";
import { isProtectedPath } from "../detectors/files.js";
import {
  diffSnapshots,
  gitStatusSnapshot,
  isGitRepo,
  type GitFileChange,
} from "../core/session.js";
import type { RiskLevel } from "../core/events.js";

const sessionApprovals = new Set<string>();

export const execAdapter: AgentAdapter = {
  id: "exec",
  description: "Runs an arbitrary shell command inside the AgentGuard boundary. Works with any AI agent.",
  async run(args, ctx) {
    const command = args.join(" ").trim();
    if (!command) {
      ctx.emit({ type: "note", level: "error", message: "No command provided to exec adapter" });
      return 2;
    }

    const verdict = evaluateCommand(command, ctx.policy, ctx.projectDir, {
      interactive: ctx.interactive,
      sessionApprovals,
    });

    let decision = verdict.decision;
    if (decision === "allow_once") {
      const answer = await promptApproval(command, verdict.reasons);
      if (answer === "deny") {
        decision = "deny";
      } else {
        for (const key of verdict.approvalKeys) sessionApprovals.add(key);
        decision = answer === "session" ? "allow_session" : "allow_once";
      }
    }

    if (decision === "deny") {
      ctx.emit({
        type: "command",
        command: verdict.redactedCommand,
        commandSha256: crypto.createHash("sha256").update(command).digest("hex"),
        decision,
        risk: verdict.risk,
        reasons: verdict.reasons,
        ruleIds: verdict.ruleIds,
        approvedBy: null,
        exitCode: null,
        durationMs: null,
        blocked: true,
      });
      console.error("AgentGuard: BLOCKED");
      for (const reason of verdict.reasons) console.error(`  - ${reason}`);
      return 126;
    }

    if (decision === "allow_once") console.error("AgentGuard: approved for this command");
    if (decision === "allow_session") console.error("AgentGuard: approved for the rest of this session");

    const git = isGitRepo(ctx.projectDir);
    const before = git ? gitStatusSnapshot(ctx.projectDir) : new Map<string, string>();
    if (!git) {
      ctx.emit({
        type: "note",
        level: "warn",
        message: "Not a git repository: file change tracking is unavailable for this command",
      });
    }

    const started = Date.now();
    const exitCode = await runChild(command, ctx.projectDir);
    const durationMs = Date.now() - started;

    ctx.emit({
      type: "command",
      command: verdict.redactedCommand,
      commandSha256: crypto.createHash("sha256").update(command).digest("hex"),
      decision,
      risk: verdict.risk,
      reasons: verdict.reasons,
      ruleIds: verdict.ruleIds,
      approvedBy:
        decision === "allow_once" ? "user_once" : decision === "allow_session" ? "user_session" : null,
      exitCode,
      durationMs,
      blocked: false,
    });

    if (git) {
      const after = gitStatusSnapshot(ctx.projectDir);
      for (const change of diffSnapshots(before, after)) {
        emitFileChange(ctx, change, ctx.policy.permissions.filesystem.protected);
      }
    }

    return exitCode;
  },
};

function runChild(command: string, cwd: string): Promise<number> {
  return new Promise((resolve) => {
    const shell =
      process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : process.env.SHELL ?? "/bin/bash";
    const child = spawn(command, { cwd, stdio: "inherit", shell });
    child.on("error", () => resolve(127));
    child.on("close", (code) => resolve(code ?? 1));
  });
}

function emitFileChange(
  ctx: Parameters<AgentAdapter["run"]>[1],
  change: GitFileChange,
  protectedPatterns: string[]
): void {
  const pattern = isProtectedPath(change.path, protectedPatterns);
  let risk: RiskLevel = "low";
  const reasons: string[] = [];
  const normalized = change.path.replace(/\\/g, "/");
  if (pattern) {
    risk = "high";
    reasons.push(`Path matches protected pattern "${pattern}"`);
  } else if (/^(src|lib|app).*\/.*(auth|login|session|token|password|credential)/i.test(normalized)) {
    risk = "medium";
    reasons.push("Authentication-related source file changed");
  }
  ctx.emit({
    type: "file_change",
    path: change.path,
    change: change.change,
    risk,
    reasons,
  });
}

async function promptApproval(command: string, reasons: string[]): Promise<"once" | "session" | "deny"> {
  console.error("\nAgentGuard requires approval:");
  console.error(`  $ ${command}`);
  for (const reason of reasons) console.error(`  - ${reason}`);
  process.stderr.write("  [a] allow once   [s] allow for session   [d] deny > ");
  return new Promise((resolve) => {
    const onData = (buf: Buffer) => {
      const line = buf.toString().trim().toLowerCase();
      cleanup();
      if (line === "a") resolve("once");
      else if (line === "s") resolve("session");
      else resolve("deny");
    };
    const onEnd = () => {
      cleanup();
      resolve("deny");
    };
    function cleanup() {
      process.stdin.removeListener("data", onData);
      process.stdin.removeListener("end", onEnd);
      process.stdin.pause();
    }
    if (process.stdin.isTTY) {
      process.stdin.resume();
      process.stdin.once("data", onData);
      process.stdin.once("end", onEnd);
    } else {
      resolve("deny");
    }
  });
}
