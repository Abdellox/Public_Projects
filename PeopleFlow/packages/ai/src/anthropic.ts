import type { AiMessage, AIProvider, ChatOptions, ChatResult } from "./types.js";

interface AnthropicConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  version?: string;
}

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  constructor(private readonly config: AnthropicConfig) {}

  get model(): string {
    return this.config.model;
  }

  isAvailable(): boolean {
    return Boolean(this.config.apiKey);
  }

  async chat(messages: AiMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const baseUrl = (this.config.baseUrl ?? "https://api.anthropic.com").replace(/\/$/, "");
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const rest = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

    const res = await fetch(`${baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": this.config.version ?? "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model,
        ...(system ? { system } : {}),
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.2,
        messages: rest,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`AI provider error (${res.status}): ${detail.slice(0, 300)}`);
    }
    const json = (await res.json()) as { content?: { text?: string }[] };
    const content = json.content?.map((c) => c.text ?? "").join("") ?? "";
    if (!content) throw new Error("AI provider returned an empty response");
    return { content, provider: this.name, model: this.config.model };
  }
}
