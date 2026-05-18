import { validateLayoutItems } from "../adaptive-engine/core/index.js";
import { COMPOSITION_STATUS, resolveCompositionPlan } from "../composition-engine/index.js";
import { RUNTIME_STATUS } from "./contracts/runtimeStatus.js";

export function resolveRuntimeCandidate({
  items = [],
  candidateItems = items,
  metrics,
  sourceMetrics,
  contentSchemas,
  dependencies,
  relationships,
  policy,
  mode = "suggest",
  strategy = "unknown"
} = {}) {
  const geometry = validateLayoutItems(candidateItems, metrics);
  const composition = resolveCompositionPlan({
    mode,
    items: candidateItems,
    metrics,
    sourceMetrics,
    contentSchemas,
    dependencies,
    relationships,
    policy
  });
  const compositionReady = composition.valid && composition.status !== COMPOSITION_STATUS.ERROR;
  const geometryReady = geometry.valid;
  const accepted = compositionReady && geometryReady;

  return {
    strategy,
    accepted,
    status: resolveCandidateStatus({ accepted, compositionReady, geometryReady }),
    items: accepted ? candidateItems : items,
    candidateItems,
    composition,
    geometry,
    reason: accepted ? null : resolveCandidateReason({ compositionReady, geometryReady })
  };
}

function resolveCandidateStatus({ accepted, compositionReady, geometryReady }) {
  if (accepted) {
    return RUNTIME_STATUS.READY;
  }

  if (!geometryReady) {
    return RUNTIME_STATUS.BLOCKED_BY_GEOMETRY;
  }

  if (!compositionReady) {
    return RUNTIME_STATUS.BLOCKED_BY_COMPOSITION;
  }

  return RUNTIME_STATUS.NEEDS_COMPOSITION_COMMAND;
}

function resolveCandidateReason({ compositionReady, geometryReady }) {
  if (!geometryReady) {
    return "geometry-rejected-candidate";
  }

  if (!compositionReady) {
    return "composition-rejected-candidate";
  }

  return "candidate-not-ready";
}
