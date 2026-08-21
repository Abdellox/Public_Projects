import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { Command } from "commander";
import YAML from "yaml";
import type { AgentGuardEvent, EventInput } from "../core/events.js";
import { loadPolicy, PolicyValidationError, defaultPolicy } from "../core/policy.js";
import { SessionStore } from "../core/session.js";
import { execAdapter } from "../adapters/exec.js";
import { renderTextReport } from "../report/text.js";
import { renderMarkdownReport } from "../report/markdown.js";

const program = new Command();

program.name("agentguard").description("Give your AI coding agent a security boundary.").version("0.1.0");

function projectDir(): string {
  return process.cwd();
}

function storeDir(): string {
  return path.join(projectDir(), ".agentguard", "sessions");
}

function openStore(): SessionStore {
  return new SessionStore(storeDir());
}

function resolveSession(store: SessionStore, explicit?: string): string {
  const fromEnv = process.env.AGENTGUARD_SESSION;
  const id = explicit ?? fromEnv;
  if (!id) {
    console.error("No session specified. Pass a session id or set AGENTGUARD_SESSION.");
    process.exit(2);
  }
  if (!store.getMeta(id)) {
    console.error(`Unknown session: ${id}`);
    process.exit(2);
  }
  return id;
}

program
  .command("init")
  .description("Create .agentguard/policy.yaml in the current project")
  .action(() => {
    const dir = path.join(projectDir(), ".agentguard");
    fs.mkdirSync(dir, { recursive: true });
    const policyPath = path.join(dir, "policy.yaml");
    if (fs.existsSync(policyPath)) {
      console.log("Policy already exists:", policyPath);
    } else {
      const template = `# AgentGuard policy
# Docs: https://github.com/agentguard/agentguard#security-model
${YAML.stringify(defaultPolicy())}`;
      fs.writeFileSync(policyPath, template);
      console.log("Created", policyPath);
    }
    const gitignore = path.join(projectDir(), ".gitignore");
    const ignoreEntry = ".agentguard/sessions/";
    if (fs.existsSync(gitignore)) {
      const content = fs.readFileSync(gitignore, "utf8");
      if (!content.split(/\r?\n/).includes(ignoreEntry)) {
        fs.appendFileSync(gitignore, `${ignoreEntry}\n`);
        console.log("Added", ignoreEntry, "to .gitignore");
      }
    } else {
      fs.writeFileSync(gitignore, `${ignoreEntry}\n`);
      console.log("Created .gitignore with", ignoreEntry);
    }
  });

program
  .command("exec")
  .description("Run a shell command inside the AgentGuard boundary")
  .option("--agent <name>", "agent name recorded for this session", "manual")
  .option("--continue [sessionId]", "append to an existing session instead of creating one")
  .argument("<command...>", "command to execute")
  .action(async (_cmd: string[], opts) => {
    const store = openStore();
    const dir = projectDir();
    let loaded;
    try {
      loaded = loadPolicy(dir);
    } catch (err) {
      if (err instanceof PolicyValidationError) {
        console.error("Invalid policy:", err.message);
        process.exit(2);
      }
      throw err;
    }
    for (const w of loaded.warnings) console.error(`AgentGuard: ${w}`);

    const continueId =
      typeof opts.continue === "string" ? opts.continue : process.env.AGENTGUARD_SESSION || undefined;
    let sessionId: string;
    if (continueId && store.getMeta(continueId)) {
      sessionId = continueId;
    } else {
      sessionId = store.createSession(opts.agent, dir, loaded.path).id;
      console.error(`AgentGuard session: ${sessionId}`);
    }

    let seq = store.readEvents(sessionId).length;
    const emit = (partial: EventInput) => {
      const event = {
        ...partial,
        id: crypto.randomUUID(),
        seq: seq++,
        sessionId,
        timestamp: new Date().toISOString(),
        agent: opts.agent,
      } as AgentGuardEvent;
      store.appendEvent(sessionId, event);
    };

    emit({ type: "session_start", workingDirectory: dir, policyPath: loaded.path });

    const code = await execAdapter.run(_cmd, {
      sessionId,
      agent: opts.agent,
      projectDir: dir,
      policy: loaded.policy,
      store,
      interactive: Boolean(process.stdin.isTTY),
      emit,
    });

    emit({ type: "session_end", exitCode: code });
    store.finalizeSession(sessionId);
    process.env.AGENTGUARD_SESSION = sessionId;
    console.error(`AgentGuard: session ${sessionId} (use \`agentguard report ${sessionId}\`)`);
    process.exit(code);
  });

program
  .command("sessions")
  .description("List recorded sessions")
  .action(() => {
    const sessions = openStore().listSessions();
    if (sessions.length === 0) {
      console.log("No sessions recorded yet.");
      return;
    }
    for (const s of sessions) {
      console.log(`${s.id}  ${s.startedAt}  agent=${s.agent}  ${s.workingDirectory}`);
    }
  });

program
  .command("show")
  .description("Show all events of a session as JSON")
  .argument("<sessionId>")
  .action((id) => {
    const store = openStore();
    resolveSession(store, id);
    for (const event of store.readEvents(id)) {
      console.log(JSON.stringify(event));
    }
  });

program
  .command("replay")
  .description("Replay a session chronologically")
  .argument("<sessionId>")
  .action((id) => {
    const store = openStore();
    resolveSession(store, id);
    const meta = store.getMeta(id)!;
    const start = new Date(meta.startedAt).getTime();
    console.log(`Replay of ${id} (agent: ${meta.agent})`);
    for (const e of store.readEvents(id)) {
      const offset = ((new Date(e.timestamp).getTime() - start) / 1000).toFixed(1).padStart(7);
      switch (e.type) {
        case "session_start":
          console.log(`[${offset}s] session started in ${e.workingDirectory}`);
          break;
        case "command":
          console.log(
            `[${offset}s] ${e.blocked ? "BLOCKED" : "EXEC   "} ${e.command}` +
              (e.exitCode !== null ? `  (exit ${e.exitCode})` : "")
          );
          break;
        case "file_change":
          console.log(`[${offset}s] ${e.change.padEnd(8)} ${e.path} (${e.risk})`);
          break;
        case "secret_detected":
          console.log(`[${offset}s] SECRET  ${e.secretType}: ${e.sample}`);
          break;
        case "note":
          if (e.level !== "info") console.log(`[${offset}s] NOTE    ${e.message}`);
          break;
        case "session_end":
          console.log(`[${offset}s] session ended (exit ${e.exitCode})`);
          break;
      }
    }
  });

program
  .command("report")
  .description("Generate a security report for a session")
  .argument("<sessionId>")
  .option("-f, --format <format>", "output format: text or markdown", "text")
  .action((id, opts) => {
    const store = openStore();
    resolveSession(store, id);
    const meta = store.getMeta(id)!;
    const events = store.readEvents(id);
    const data = { meta, events };
    if (opts.format === "markdown") console.log(renderMarkdownReport(data));
    else if (opts.format === "text") console.log(renderTextReport(data));
    else {
      console.error(`Unknown format: ${opts.format}. Use text or markdown.`);
      process.exit(2);
    }
  });

program
  .command("policy")
  .description("Policy utilities")
  .addCommand(
    new Command("check")
      .description("Validate .agentguard/policy.yaml")
      .action(() => {
        try {
          const { policy, path: p, warnings } = loadPolicy(projectDir());
          for (const w of warnings) console.log(`warn: ${w}`);
          if (p) console.log(`OK: ${p} is valid (version ${policy.version})`);
          else console.log("OK: using built-in default policy (no policy file found)");
          if (policy.permissions.network.mode === "allowlist") {
            console.log(
              "warn: network.mode=allowlist is configured but network enforcement is NOT implemented yet; see the roadmap"
            );
          }
        } catch (err) {
          if (err instanceof PolicyValidationError) {
            console.error("INVALID:", err.message);
            process.exit(1);
          }
          throw err;
        }
      })
  );

program
  .command("doctor")
  .description("Check your AgentGuard installation")
  .action(() => {
    let ok = true;
    const check = (name: string, pass: boolean, detail = "") => {
      console.log(`${pass ? "[ok]" : "[!!]"} ${name}${detail ? ` - ${detail}` : ""}`);
      if (!pass) ok = false;
    };
    check("Node.js >= 18", Number(process.versions.node.split(".")[0]) >= 18, process.versions.node);
    check(
      "Git available",
      (() => {
        try {
          execFileSync("git", ["--version"], { stdio: "pipe" });
          return true;
        } catch {
          return false;
        }
      })(),
      "needed for file change tracking"
    );
    try {
      const { warnings } = loadPolicy(projectDir());
      check("Policy loads", true, warnings.length > 0 ? warnings.join("; ") : "");
    } catch (err) {
      check("Policy loads", false, (err as Error).message);
    }
    try {
      fs.accessSync(projectDir(), fs.constants.W_OK);
      check("Project directory writable", true);
    } catch {
      check("Project directory writable", false);
    }
    process.exit(ok ? 0 : 1);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
