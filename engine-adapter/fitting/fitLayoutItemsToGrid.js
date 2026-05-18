import { validateLayoutItems } from "../../adaptive-engine/core/index.js";
import { fitLayoutItemGeometry } from "./fitLayoutItemGeometry.js";
import { placeLayoutItems } from "./placeLayoutItems.js";
import { validateItemsAgainstReservedArea } from "./reservedAreaGeometry.js";
import { resolveLayoutItemBehavior } from "./resolveLayoutItemBehavior.js";

export function fitLayoutItemsToGrid({
  items,
  metrics,
  sourceMetrics = metrics,
  contentSchemas = {},
  reservedArea = null,
  reservedItemIds = []
}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const candidates = [];
  const reservedIds = new Set(reservedItemIds.map(String));
  let changed = false;

  for (const item of sourceItems) {
    const behavior = resolveLayoutItemBehavior({
      item,
      metrics,
      sourceMetrics,
      contentSchemas
    });
    const geometry = fitLayoutItemGeometry({
      item,
      metrics,
      sourceMetrics
    });

    if (!geometry.valid) {
      return {
        valid: false,
        changed: false,
        items: sourceItems,
        reason: geometry.reason
      };
    }

    changed = changed || geometry.changed;

    candidates.push({
      source: item,
      area: geometry.item,
      minSize: behavior.minSize,
      priority: behavior.priority,
      canUseReservedArea: reservedIds.has(String(item.id))
    });
  }

  const placedItems = placeLayoutItems(candidates, metrics, {
    reservedArea
  });
  const fittedItems = sourceItems.map((item) => placedItems.get(String(item.id)) ?? item);
  const reservedValidation = validateItemsAgainstReservedArea({
    items: fittedItems,
    metrics,
    reservedArea,
    reservedItemIds
  });

  if (!reservedValidation.valid) {
    return {
      valid: false,
      changed: false,
      items: sourceItems,
      reason: reservedValidation.errors[0]?.type ?? "NO_SPACE_AFTER_FIXED_SIDEBAR",
      errors: reservedValidation.errors
    };
  }

  const layoutValidation = validateLayoutItems(fittedItems, metrics);

  if (!layoutValidation.valid) {
    return {
      valid: false,
      changed: false,
      items: sourceItems,
      reason: layoutValidation.errors[0]?.type ?? "LAYOUT_VALIDATION_FAILED",
      errors: layoutValidation.errors
    };
  }

  changed = changed || !areSameItems(sourceItems, fittedItems);

  return {
    valid: true,
    changed,
    items: changed ? fittedItems : sourceItems,
    reason: null
  };
}

function areSameItems(leftItems, rightItems) {
  if (leftItems.length !== rightItems.length) {
    return false;
  }

  return leftItems.every((leftItem, index) => {
    const rightItem = rightItems[index];

    return (
      String(leftItem.id) === String(rightItem.id) &&
      leftItem.x === rightItem.x &&
      leftItem.y === rightItem.y &&
      leftItem.w === rightItem.w &&
      leftItem.h === rightItem.h
    );
  });
}
