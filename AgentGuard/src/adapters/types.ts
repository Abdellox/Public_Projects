import type { AgentGuardEvent, EventInput } from "../core/events.js";
import type { Policy } from "../core/policy.js";
import type { SessionStore } from "../core/session.js";

export interface AdapterContext {
  sessionId: string;
  agent: string;
  projectDir: string;
  policy: Policy;
  store: SessionStore;
  interactive: boolean;
  emit(event: EventInput): void;
}

export interface AgentAdapter {
  id: string;
  description: string;
  run(args: string[], ctx: AdapterContext): Promise<number>;
}
