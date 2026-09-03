import type { AiMessage, AIProvider, ChatOptions, ChatResult } from "./types.js";

interface OpenAiConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

/**
 * OpenAI-compatible adapter. Works with OpenAI, Azure-style gateways, OpenRouter,
 * LM Studio/Ollama (local models) — anything speaking /chat/completions.
 */
export class OpenAICompatibleProvider implements AIProvider {
  readonly name = "openai";
  constructor(private readonly config: OpenAiConfig) {}

  get model(): string {
    return this.config.model;
  }

  isAvailable(): boolean {
    return Boolean(this.config.apiKey);
  }

  async chat(messages: AiMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const baseUrl = (this.config.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 1024,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`AI provider error (${res.status}): ${detail.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("AI provider returned an empty response");
    return { content, provider: this.name, model: this.config.model };
  }
}
