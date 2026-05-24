import { validateLayoutItems } from "../../adaptive-engine/core/index.js";
import { ADAPTER_STATUS } from "../contracts/adapterStatus.js";
import { createAdapterResult } from "../contracts/createAdapterResult.js";
import { resolveLayoutRelationProjection } from "./resolveLayoutRelationProjection.js";

export function applyLayoutRelationProjectionCommand({
  items = [],
  metrics,
  sourceMetrics = metrics
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const projectedItems = resolveLayoutRelationProjection({
    items: sourceItems,
    metrics,
    sourceMetrics
  });
  const layoutValidation = validateLayoutItems(projectedItems, metrics);

  if (!layoutValidation.valid) {
    return createAdapterResult({
      status: ADAPTER_STATUS.ERROR,
      message: "Relation projection was not applied: layout candidate was rejected.",
      data: {
        items: sourceItems,
        changed: false
      },
      engineResult: layoutValidation
    });
  }

  const changed = hasGeometryChanged(sourceItems, projectedItems);

  if (!changed) {
    return createAdapterResult({
      status: ADAPTER_STATUS.OK,
      message: "Relation projection did not require changes.",
      data: {
        items: sourceItems,
        changed: false
      },
      engineResult: layoutValidation
    });
  }

  return createAdapterResult({
    status: ADAPTER_STATUS.OK,
    message: "Relation projection was applied.",
    data: {
      items: projectedItems,
      changed: true
    },
    engineResult: layoutValidation
  });
}

function hasGeometryChanged(leftItems, rightItems) {
  return createItemsSignature(leftItems) !== createItemsSignature(rightItems);
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
