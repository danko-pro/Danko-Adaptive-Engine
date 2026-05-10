import { validateLayoutItems } from "../adaptive-engine/core/index.js";
import { COMPOSITION_STATUS, resolveCompositionPlan } from "../composition-engine/index.js";
import { RUNTIME_STATUS } from "./contracts/runtimeStatus.js";

export function resolveRuntimeBridge({
  items = [],
  metrics,
  sourceMetrics,
  contentSchemas,
  policy,
  mode = "suggest"
} = {}) {
  const composition = resolveCompositionPlan({
    mode,
    items,
    metrics,
    sourceMetrics,
    contentSchemas,
    policy
  });

  const geometry = validateLayoutItems(items, metrics);
  const compositionReady = composition.valid && composition.status !== COMPOSITION_STATUS.ERROR;
  const geometryReady = geometry.valid;
  const canApply = compositionReady && geometryReady;

  return {
    status: resolveRuntimeStatus({ compositionReady, geometryReady }),
    canApply,
    items,
    composition,
    geometry,
    handoff: {
      v1: "geometry-check",
      v2: "composition-plan",
      v3: "navigation-context",
      runtime: "handoff-bridge"
    }
  };
}

function resolveRuntimeStatus({ compositionReady, geometryReady }) {
  if (compositionReady && geometryReady) {
    return RUNTIME_STATUS.READY;
  }

  if (!compositionReady) {
    return RUNTIME_STATUS.BLOCKED_BY_COMPOSITION;
  }

  if (!geometryReady) {
    return RUNTIME_STATUS.NEEDS_COMPOSITION_COMMAND;
  }

  return RUNTIME_STATUS.BLOCKED_BY_GEOMETRY;
}
