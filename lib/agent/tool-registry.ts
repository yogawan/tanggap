import { allTools } from "../tools";
import type { ToolDefinition } from "../tools/shared";

const registry = new Map<string, ToolDefinition<unknown, unknown>>(
  allTools.map((tool) => [tool.name, tool]),
);

export function getTool(
  name: string,
): ToolDefinition<unknown, unknown> | undefined {
  return registry.get(name);
}

export function listTools(): ToolDefinition<unknown, unknown>[] {
  return [...registry.values()];
}

export type ToolSummary = {
  name: string;
  description: string;
  riskLevel: ToolDefinition<unknown, unknown>["riskLevel"];
};

export function listToolSummaries(): ToolSummary[] {
  return listTools().map(({ name, description, riskLevel }) => ({
    name,
    description,
    riskLevel,
  }));
}
