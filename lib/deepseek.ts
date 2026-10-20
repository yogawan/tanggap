import OpenAI, { APIError } from "openai";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { z } from "zod";
import type { ToolDefinition } from "./tools/shared";

// Model names were renamed mid-2026; "deepseek-chat"/"deepseek-reasoner" are
// retired. "deepseek-flash" is the current default per DeepSeek's docs.
export const DEEPSEEK_MODEL = "deepseek-flash";

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

type ToolMeta = Pick<
  ToolDefinition<unknown, unknown>,
  "name" | "description" | "inputSchema"
>;

// Standard OpenAI function-calling tool schema — works for any
// OpenAI-compatible provider (DeepSeek, Groq, ...), not just DeepSeek.
export function toolsToOpenAIFormat(tools: ToolMeta[]): ChatCompletionTool[] {
  return tools.map((tool) => {
    const schema = z.toJSONSchema(tool.inputSchema) as Record<string, unknown>;
    delete schema.$schema;
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: schema,
      },
    };
  });
}

export function isInsufficientBalanceError(err: unknown): boolean {
  return err instanceof APIError && err.status === 402;
}
