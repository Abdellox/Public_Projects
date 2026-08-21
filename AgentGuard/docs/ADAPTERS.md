# Writing an AgentGuard adapter

An adapter connects one AI coding agent to AgentGuard's event pipeline. The core system is agent-agnostic: it knows about events, policies, and sessions — never about specific tools.

## The interface

```ts
// src/adapters/types.ts
export interface AdapterContext {
  sessionId: string;
  agent: string;
  projectDir: string;
  policy: Policy;
  store: SessionStore;
  interactive: boolean;
  emit(event: EventInput): void;   // fills in id/seq/sessionId/timestamp/agent
}

export interface AgentAdapter {
  id: string;
  description: string;
  run(args: string[], ctx: AdapterContext): Promise<number>; // process exit code
}
```

The shipped `exec` adapter (`src/adapters/exec.ts`) is the reference implementation. Read it before writing your own.

## Contract rules

1. **Emit events for everything you observe**, even when you cannot prevent it. Recording is always better than silence.
2. **Never bypass the engine.** Decisions come from `evaluateCommand` (or future engine entry points). Adapters do not invent their own security logic.
3. **Redact before you store.** Anything that might contain a secret goes through `redactSecrets` before `emit`.
4. **Respect `interactive`.** If false, never prompt: deny or degrade instead.
5. **Return a meaningful exit code.** Convention: `126` for blocked commands, the child's exit code otherwise, `127` for spawn failures.

## Event types

| Type | When | Key fields |
| --- | --- | --- |
| `command` | A command was evaluated and (maybe) run | `command` (redacted), `decision`, `risk`, `reasons`, `ruleIds`, `blocked`, `exitCode`, `durationMs` |
| `file_change` | A file was created/modified/deleted | `path`, `change`, `risk`, `reasons` |
| `secret_detected` | A secret pattern was found | `secretType`, `sample` (redacted), `context` |
| `note` | Warnings, limitations, lifecycle notes | `level`, `message` |
| `session_start` / `session_end` | Session boundaries | context fields |

The event model is designed to be stable and self-describing so external tooling (replay UIs, CI checks) can consume session JSONL without knowing the adapter.

## Adapter strategies, by integration depth

1. **Wrapper (shipped):** the agent runs commands through `agentguard exec --`. Works with every agent today; sees only what passes through the wrapper.
2. **Hook-based:** if an agent exposes hooks (pre/post command execution), register AgentGuard as the hook target. Example: Claude Code's hook system can route its Bash tool through AgentGuard. This gives per-tool-call visibility without wrapping the shell.
3. **Native plugin:** if an agent has a plugin API (e.g., OpenCode plugins), implement the adapter inside that API and stream richer events (tool calls, file edits, prompts) into the same event model.

## Checklist for a new adapter

- [ ] New file under `src/adapters/<agent-id>.ts` exporting an `AgentAdapter`
- [ ] Registered in the CLI with sensible flags
- [ ] Emits `session_start`/`session_end` only via the shared CLI flow (adapters assume the session exists)
- [ ] Handles non-TTY environments without prompting
- [ ] Unit tests covering allow, block, and approval paths
- [ ] README "Supported agents" row updated with honest capability notes
