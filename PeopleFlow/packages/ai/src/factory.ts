import type { AIProvider } from "./types.js";
import { NoopProvider } from "./types.js";
import { OpenAICompatibleProvider } from "./openai.js";
import { AnthropicProvider } from "./anthropic.js";

export interface AiConfig {
  provider: "none" | "openai" | "anthropic";
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export function createAiProvider(config: AiConfig): AIProvider {
  switch (config.provider) {
    case "openai":
      return new OpenAICompatibleProvider({
        apiKey: config.apiKey ?? "",
        model: config.model,
        baseUrl: config.baseUrl,
      });
    case "anthropic":
      return new AnthropicProvider({
        apiKey: config.apiKey ?? "",
        model: config.model,
        baseUrl: config.baseUrl,
      });
    default:
      return new NoopProvider();
  }
}
