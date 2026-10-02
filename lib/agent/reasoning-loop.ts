import type {
  ChatCompletion,
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import {
  DEEPSEEK_MODEL,
  deepseek,
  isInsufficientBalanceError,
  toolsToDeepSeekFormat,
} from "../deepseek";
import { AgentExecutionManager } from "./execution-manager";
import { buildSystemPrompt } from "./system-prompt";
import { getTool, listTools } from "./tool-registry";

export type AgentTaskResult =
  | { status: "completed"; executionId: string; message: string }
  | {
      status: "pending_approval";
      executionId: string;
      tool: string;
      input: unknown;
      message: string;
    }
  | { status: "failed"; executionId: string; error: string };

export type CreateCompletionFn = (args: {
  model: string;
  messages: ChatCompletionMessageParam[];
  tools: ChatCompletionTool[];
}) => Promise<ChatCompletion>;

const defaultCreateCompletion: CreateCompletionFn = (args) =>
  deepseek.chat.completions.create({ ...args, stream: false });

function safeParseArgs(raw: string | undefined): unknown {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Drives one task through DeepSeek's tool-calling loop: send messages, run
 * whatever low-risk tools the model asks for, feed results back, repeat.
 * Pauses (without executing anything from that turn) the moment the model
 * requests a high-risk tool — Fase 7's approve/reject API resumes from there.
 */
export async function runAgentTask(
  userMessage: string,
  options: { maxSteps?: number; createCompletion?: CreateCompletionFn } = {},
): Promise<AgentTaskResult> {
  const maxSteps = options.maxSteps ?? 12;
  const createCompletion = options.createCompletion ?? defaultCreateCompletion;

  const manager = new AgentExecutionManager();
  await manager.start(userMessage);

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: userMessage },
  ];

  const tools = toolsToDeepSeekFormat(listTools());

  for (let step = 0; step < maxSteps; step++) {
    let completion: ChatCompletion;
    try {
      completion = await createCompletion({
        model: DEEPSEEK_MODEL,
        messages,
        tools,
      });
    } catch (err) {
      const error = isInsufficientBalanceError(err)
        ? "DeepSeek balance is insufficient. Top up at https://platform.deepseek.com and try again."
        : err instanceof Error
          ? err.message
          : String(err);
      await manager.logDecision(`DeepSeek call failed: ${error}`);
      await manager.complete("failed");
      return { status: "failed", executionId: manager.id, error };
    }

    const message = completion.choices[0].message;
    messages.push(message);

    const toolCalls = (message.tool_calls ?? []).filter(
      (tc) => tc.type === "function",
    );

    if (toolCalls.length === 0) {
      await manager.logReasoning(message.content ?? "(no content)");
      await manager.complete("completed");
      return {
        status: "completed",
        executionId: manager.id,
        message: message.content ?? "",
      };
    }

    if (message.content) {
      await manager.logReasoning(message.content);
    }

    // If any tool call in this turn is high-risk, pause the whole turn before
    // executing anything — never leave some of the batch's tool_call_ids
    // unanswered while waiting on a decision for just one of them.
    const highRiskCall = toolCalls.find(
      (tc) => getTool(tc.function.name)?.riskLevel === "high",
    );
    if (highRiskCall) {
      const input = safeParseArgs(highRiskCall.function.arguments);
      await manager.logDecision(
        `Proposing ${highRiskCall.function.name} with ${JSON.stringify(input)} — awaiting human approval.`,
      );
      return {
        status: "pending_approval",
        executionId: manager.id,
        tool: highRiskCall.function.name,
        input,
        message:
          message.content ?? `Proposing to run ${highRiskCall.function.name}.`,
      };
    }

    for (const toolCall of toolCalls) {
      const input = safeParseArgs(toolCall.function.arguments);
      const result = await manager.runTool(toolCall.function.name, input);
      const toolMessage: ChatCompletionToolMessageParam = {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      };
      messages.push(toolMessage);
    }
  }

  await manager.complete("failed");
  return {
    status: "failed",
    executionId: manager.id,
    error: "Max steps exceeded without resolution",
  };
}
