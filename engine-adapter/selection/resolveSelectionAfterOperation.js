import { resolveAdapterSelection } from "./resolveAdapterSelection.js";

export function resolveSelectionAfterOperation(operation, items, metrics) {
  if (operation?.type === "delete-area") {
    return null;
  }

  const target = items.find((item) => String(item.id) === String(operation?.targetId));

  if (!target) {
    return null;
  }

  return resolveAdapterSelection({
    cell: {
      x: target.x,
      y: target.y
    },
    items,
    metrics
  });
}
