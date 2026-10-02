export type PlanStage =
  | "investigate"
  | "diagnose"
  | "find_replacement_vehicle"
  | "find_replacement_driver"
  | "validate_resources"
  | "reassign"
  | "update_eta"
  | "notify_customer"
  | "verify";

/**
 * Stub: this is the MVP's one hardcoded recipe (PRD §11, vehicle breakdown only),
 * used so execution-manager is testable before DeepSeek exists. Fase 5 makes this
 * a pass-through — the LLM decides the actual order (and tool inputs) at runtime
 * via tool-calling, this default is kept only as a fallback reference.
 */
export function defaultVehicleBreakdownPlan(): PlanStage[] {
  return [
    "investigate",
    "diagnose",
    "find_replacement_vehicle",
    "find_replacement_driver",
    "validate_resources",
    "reassign",
    "update_eta",
    "notify_customer",
    "verify",
  ];
}
