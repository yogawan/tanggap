import type { RiskLevel } from "../tools/shared";

export type GuardrailCheck =
  | { allowed: true }
  | { allowed: false; reason: string };

export type GuardedTool = {
  name: string;
  riskLevel: RiskLevel;
};

/**
 * The single gate a high-risk tool call must pass through. Fase 7 (HITL) relies
 * on this being the *only* path that can trigger a high-risk tool — nothing else
 * should call `tool.handler` directly for a high-risk tool without going through here.
 */
export function checkGuardrail(
  tool: GuardedTool,
  approved: boolean,
): GuardrailCheck {
  if (tool.riskLevel === "high" && !approved) {
    return {
      allowed: false,
      reason: `Tool '${tool.name}' is high-risk and requires explicit approval before execution.`,
    };
  }
  return { allowed: true };
}
