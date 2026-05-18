import { resolveRuntimeCandidate } from "../../engine-runtime/index.js";
import { fitItemsToGridCommand } from "../commands/fitItemsToGridCommand.js";

export function applyCompositionFixCommand({
  items = [],
  metrics,
  sourceMetrics,
  contentSchemas,
  dependencies,
  relationships,
  policy,
  mode = "suggest"
} = {}) {
  const projection = fitItemsToGridCommand({
    items,
    metrics,
    sourceMetrics,
    contentSchemas
  });

  if (!projection.valid) {
    return createFixResult({
      valid: false,
      changed: false,
      items,
      plan: null,
      message: `V2 fix не собрал кандидат: ${formatProjectionFailureReason(projection)}.`
    });
  }

  const runtime = resolveRuntimeCandidate({
    items,
    candidateItems: projection.items,
    metrics,
    sourceMetrics,
    contentSchemas,
    dependencies,
    relationships,
    policy,
    mode,
    strategy: "fit-to-grid"
  });

  if (!runtime.accepted) {
    return createFixResult({
      valid: false,
      changed: false,
      items,
      plan: runtime.composition,
      runtime,
      message: `V2 fix отклонен runtime: ${runtime.reason}.`
    });
  }

  return createFixResult({
    valid: true,
    changed: projection.changed || !areSameItems(items, runtime.items),
    items: runtime.items,
    plan: runtime.composition,
    runtime,
    message: projection.changed
      ? "V2 fix применил безопасную подгонку."
      : "V2 fix проверил сцену: правки не нужны."
  });
}

function createFixResult({
  valid,
  changed,
  items,
  plan,
  runtime = null,
  message
}) {
  return {
    valid,
    changed,
    items,
    plan,
    runtime,
    message,
    statusMessage: message
  };
}

function formatProjectionFailureReason(projection) {
  return projection?.reason ?? projection?.errors?.[0]?.type ?? "LAYOUT_PROJECTION_FAILED";
}

function areSameItems(leftItems, rightItems) {
  return createItemsSignature(leftItems) === createItemsSignature(rightItems);
}

function createItemsSignature(items) {
  if (!Array.isArray(items)) {
    return "invalid";
  }

  return items
    .map((item) => [
      String(item.id),
      Number(item.x),
      Number(item.y),
      Number(item.w),
      Number(item.h)
    ].join(":"))
    .join("|");
}
