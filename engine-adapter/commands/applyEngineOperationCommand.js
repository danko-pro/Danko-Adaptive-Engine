import { applyOperation, resolveSelection } from "../../adaptive-engine/core/index.js";

export function applyEngineOperationCommand({
  items,
  operation,
  metrics,
  fallbackItems = items
}) {
  const result = applyOperation(items, operation, metrics);

  if (!result.valid) {
    return {
      valid: false,
      items: fallbackItems,
      selection: null,
      result
    };
  }

  return {
    valid: true,
    items: result.items,
    selection: resolveSelectionAfterOperation(operation, result.items, metrics),
    result
  };
}

export function resolveSelectionAfterOperation(operation, items, metrics) {
  if (operation?.type === "delete-area") {
    return null;
  }

  const target = items.find((item) => String(item.id) === String(operation?.targetId));

  if (!target) {
    return null;
  }

  return resolveSelection({
    cell: {
      x: target.x,
      y: target.y
    },
    items,
    metrics
  });
}
