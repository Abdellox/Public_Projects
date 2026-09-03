export type AiRole = "system" | "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResult {
  content: string;
  provider: string;
  model: string;
}

/** Provider-agnostic chat interface. PeopleFlow never depends on a single vendor. */
export interface AIProvider {
  readonly name: string;
  readonly model: string;
  isAvailable(): boolean;
  chat(messages: AiMessage[], opts?: ChatOptions): Promise<ChatResult>;
}

export class NoopProvider implements AIProvider {
  readonly name = "noop";
  constructor(readonly model = "none") {}
  isAvailable(): boolean {
    return false;
  }
  async chat(): Promise<ChatResult> {
    throw new Error("AI assistant is not configured. Set AI_PROVIDER and AI_API_KEY.");
  }
}
