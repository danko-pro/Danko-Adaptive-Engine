import { validateLayoutItems } from "../../adaptive-engine/core/index.js";
import {
  resolveSidebarLayoutOccupancy,
  resolveSidebarViewportModeFromMetrics,
  shouldPreserveSidebarSourceGeometry
} from "../../sidebar-element/index.js";
import { resolveItemsForLayoutValidation } from "../scene/resolveSceneLayoutEngineInput.js";
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
  const viewportMode = resolveSidebarViewportModeFromMetrics(metrics);
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

    const occupancy = reservedIds.has(String(item.id))
      ? resolveSidebarLayoutOccupancy(item, { viewportMode, metrics })
      : null;

    candidates.push({
      source: item,
      area: occupancy ? { ...geometry.item, ...occupancy } : geometry.item,
      minSize: behavior.minSize,
      priority: behavior.priority,
      canUseReservedArea: reservedIds.has(String(item.id))
    });
  }

  const placedItems = placeLayoutItems(candidates, metrics, {
    reservedArea
  });
  const fittedItems = sourceItems.map((item) => {
    const placed = placedItems.get(String(item.id)) ?? item;

    if (!shouldPreserveSidebarSourceGeometry(item, { viewportMode, metrics })) {
      return placed;
    }

    return {
      ...placed,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h
    };
  });
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

  const layoutValidation = validateLayoutItems(
    resolveItemsForLayoutValidation(fittedItems, sourceItems, metrics),
    metrics
  );

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
