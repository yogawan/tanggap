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
  toolsToOpenAIFormat,
} from "../deepseek";
import { GROQ_MODEL, groq } from "../groq";
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

type Provider = {
  key: string;
  name: string;
  model: string;
  createCompletion: CreateCompletionFn;
};

// DeepSeek is the documented primary provider (PRD §8). Groq is a free
// OpenAI-compatible fallback for dev/testing while DeepSeek's balance is
// $0 — opt in with LLM_PROVIDER=groq; default stays DeepSeek.
const providers: Record<string, Provider> = {
  deepseek: {
    key: "deepseek",
    name: "DeepSeek",
    model: DEEPSEEK_MODEL,
    createCompletion: (args) =>
      deepseek.chat.completions.create({ ...args, stream: false }),
  },
  groq: {
    key: "groq",
    name: "Groq",
    model: GROQ_MODEL,
    createCompletion: (args) =>
      groq.chat.completions.create({ ...args, stream: false }),
  },
};

function activeProvider(): Provider {
  return (
    providers[process.env.LLM_PROVIDER ?? "deepseek"] ?? providers.deepseek
  );
}

function safeParseArgs(raw: string | undefined): unknown {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

type LoopParams = {
  manager: AgentExecutionManager;
  provider: Provider;
  model: string;
  createCompletion: CreateCompletionFn;
  messages: ChatCompletionMessageParam[];
  maxSteps: number;
};

/**
 * Shared tool-calling loop used by both a fresh `runAgentTask` call and a
 * resumed one (Fase 7): send messages, run whatever low-risk tools the model
 * asks for, feed results back, repeat. Pauses and persists the conversation
 * so far the moment the model requests a high-risk tool — `resumeAgentTask`
 * continues from exactly that point once a human decides.
 */
async function runLoop({
  manager,
  provider,
  model,
  createCompletion,
  messages,
  maxSteps,
}: LoopParams): Promise<AgentTaskResult> {
  const tools = toolsToOpenAIFormat(listTools());

  for (let step = 0; step < maxSteps; step++) {
    let completion: ChatCompletion;
    try {
      completion = await createCompletion({ model, messages, tools });
    } catch (err) {
      const error =
        provider.name === "DeepSeek" && isInsufficientBalanceError(err)
          ? "DeepSeek balance is insufficient. Top up at https://platform.deepseek.com and try again."
          : err instanceof Error
            ? err.message
            : String(err);
      await manager.logDecision(`${provider.name} call failed: ${error}`);
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
      await manager.savePendingApproval({
        tool: highRiskCall.function.name,
        toolCallId: highRiskCall.id,
        input,
        messages,
        provider: provider.key,
        model,
      });
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

export async function runAgentTask(
  userMessage: string,
  options: {
    maxSteps?: number;
    createCompletion?: CreateCompletionFn;
    model?: string;
  } = {},
): Promise<AgentTaskResult> {
  const provider = activeProvider();
  const manager = new AgentExecutionManager();
  await manager.start(userMessage);

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: userMessage },
  ];

  return runLoop({
    manager,
    provider,
    model: options.model ?? provider.model,
    createCompletion: options.createCompletion ?? provider.createCompletion,
    messages,
    maxSteps: options.maxSteps ?? 12,
  });
}

/**
 * Resumes an execution paused on `pending_approval`. Approve runs the
 * proposed tool for real, through the same guardrail as everything else
 * (just with `approved: true`); reject feeds back a synthetic failed result
 * so the model sees what happened and can propose an alternative, same as
 * any other tool failure.
 */
export async function resumeAgentTask(
  executionId: string,
  decision: { approved: boolean },
  options: {
    maxSteps?: number;
    createCompletion?: CreateCompletionFn;
  } = {},
): Promise<AgentTaskResult> {
  const manager = AgentExecutionManager.forExisting(executionId);
  const pending = await manager.loadPendingApproval();

  if (!pending) {
    return {
      status: "failed",
      executionId,
      error: "No pending approval found for this execution.",
    };
  }

  await manager.clearPendingApproval();

  let result:
    | { success: false; error: string }
    | Awaited<ReturnType<AgentExecutionManager["runTool"]>>;
  if (decision.approved) {
    result = await manager.runTool(pending.tool, pending.input, {
      approved: true,
    });
  } else {
    await manager.logDecision(
      `Operator rejected ${pending.tool} with ${JSON.stringify(pending.input)}.`,
    );
    result = {
      success: false,
      error:
        "Operator rejected this action. Do not retry the same action — propose an alternative or state that manual intervention is required.",
    };
  }

  const toolMessage: ChatCompletionToolMessageParam = {
    role: "tool",
    tool_call_id: pending.toolCallId,
    content: JSON.stringify(result),
  };

  const provider = providers[pending.provider] ?? providers.deepseek;

  return runLoop({
    manager,
    provider,
    model: pending.model,
    createCompletion: options.createCompletion ?? provider.createCompletion,
    messages: [
      ...(pending.messages as ChatCompletionMessageParam[]),
      toolMessage,
    ],
    maxSteps: options.maxSteps ?? 12,
  });
}
