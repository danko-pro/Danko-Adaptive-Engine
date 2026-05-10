import { COMPOSITION_MODES, resolveCompositionMode } from "./contracts/compositionModes.js";
import { resolveCompositionPolicy } from "./contracts/compositionPolicy.js";

export function createCompositionContext(input = {}) {
  const mode = resolveCompositionMode(input.mode);

  return {
    mode,
    enabled: mode !== COMPOSITION_MODES.OFF,
    items: Array.isArray(input.items) ? input.items : [],
    metrics: input.metrics ?? null,
    sourceMetrics: input.sourceMetrics ?? input.metrics ?? null,
    workspaceState: input.workspaceState ?? null,
    selection: input.selection ?? null,
    contentSchemas: normalizeRecord(input.contentSchemas),
    dependencies: normalizeRecord(input.dependencies),
    relationships: Array.isArray(input.relationships) ? input.relationships : [],
    policy: resolveCompositionPolicy(input.policy ?? input.rules?.policy),
    rules: normalizeRecord(input.rules)
  };
}

function normalizeRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}
