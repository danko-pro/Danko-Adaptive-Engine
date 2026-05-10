import { COMPOSITION_STATUS, resolveCompositionPlan } from "../../composition-engine/index.js";

export function evaluateCompositionPlanCommand({
  items,
  metrics,
  sourceMetrics,
  contentSchemas,
  policy,
  mode = "suggest"
} = {}) {
  const plan = resolveCompositionPlan({
    mode,
    items,
    metrics,
    sourceMetrics,
    contentSchemas,
    policy
  });

  const valid = plan.valid && plan.status !== COMPOSITION_STATUS.ERROR;

  return {
    valid,
    status: plan.status,
    plan,
    message: valid
      ? "V2 разрешил композицию."
      : "V2 остановил композицию: есть критические нарушения."
  };
}
