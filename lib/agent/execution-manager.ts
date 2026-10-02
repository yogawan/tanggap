import type mongoose from "mongoose";
import AgentExecution from "../../models/AgentExecution";
import dbConnect from "../../models/db";
import Shipment from "../../models/Shipment";
import type { ToolResult } from "../tools/shared";
import { checkGuardrail } from "./guardrails";
import { getTool } from "./tool-registry";

type StepType = "reasoning" | "tool_call" | "tool_result" | "decision";

type Step = {
  type: StepType;
  tool?: string;
  input?: unknown;
  output?: unknown;
  message?: string;
};

/**
 * Drives one agent task end-to-end and persists every step to `AgentExecution`
 * as it happens, so the trace exists even if the process crashes mid-task.
 * Fase 5 reuses this as-is: the LLM loop calls `runTool`/`logReasoning`/etc.
 * instead of a hardcoded sequence.
 */
export class AgentExecutionManager {
  private executionId: mongoose.Types.ObjectId | null = null;

  get id(): string {
    if (!this.executionId) {
      throw new Error("AgentExecutionManager: execution not started yet");
    }
    return this.executionId.toString();
  }

  async start(task: string): Promise<string> {
    await dbConnect();
    const doc = await AgentExecution.create({
      task,
      status: "running",
      steps: [],
      startedAt: new Date(),
    });
    this.executionId = doc._id;
    return doc._id.toString();
  }

  /** Call once the shipment this execution concerns is known (e.g. after the first getShipment call). */
  async linkShipment(shipmentNumber: string): Promise<void> {
    const shipment = await Shipment.findOne({ shipmentNumber })
      .select("_id")
      .lean<{
        _id: mongoose.Types.ObjectId;
      }>();
    if (!shipment) return;
    await AgentExecution.findByIdAndUpdate(this.requireId(), {
      shipmentId: shipment._id,
    });
  }

  async logReasoning(message: string): Promise<void> {
    await this.pushStep({ type: "reasoning", message });
  }

  async logDecision(message: string): Promise<void> {
    await this.pushStep({ type: "decision", message });
  }

  /**
   * Looks up the tool by name, enforces the guardrail (blocks high-risk tools
   * without `approved: true`), and logs tool_call/tool_result steps around the
   * actual call. This is the only method that should ever invoke a tool handler.
   */
  async runTool(
    toolName: string,
    rawInput: unknown,
    options: { approved?: boolean } = {},
  ): Promise<ToolResult<unknown>> {
    const tool = getTool(toolName);
    if (!tool) {
      const error = `Unknown tool: ${toolName}`;
      await this.logDecision(error);
      return { success: false, error };
    }

    const guardrail = checkGuardrail(tool, options.approved ?? false);
    if (!guardrail.allowed) {
      await this.logDecision(guardrail.reason);
      return { success: false, error: guardrail.reason };
    }

    await this.pushStep({ type: "tool_call", tool: toolName, input: rawInput });
    const result = await tool.handler(rawInput);
    await this.pushStep({
      type: "tool_result",
      tool: toolName,
      output: result,
    });
    return result;
  }

  async complete(status: "completed" | "failed" = "completed"): Promise<void> {
    await AgentExecution.findByIdAndUpdate(this.requireId(), {
      status,
      completedAt: new Date(),
    });
  }

  private requireId(): mongoose.Types.ObjectId {
    if (!this.executionId) {
      throw new Error("AgentExecutionManager: execution not started yet");
    }
    return this.executionId;
  }

  private async pushStep(step: Step): Promise<void> {
    await AgentExecution.findByIdAndUpdate(this.requireId(), {
      $push: { steps: { ...step, timestamp: new Date() } },
    });
  }
}
