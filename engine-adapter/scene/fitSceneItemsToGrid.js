import {
  createSidebarSceneProjection,
  resolveSidebarReservedArea
} from "../../sidebar-element/index.js";
import { fitLayoutItemsToGrid } from "../fitting/fitLayoutItemsToGrid.js";
import { mergeScopedSceneItems } from "./mergeScopedSceneItems.js";

export function fitSceneItemsToGrid({
  items,
  metrics,
  sourceMetrics = metrics,
  contentSchemas = {}
}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const projection = createSidebarSceneProjection(sourceItems);
  const { reservedArea, participants } = resolveSidebarReservedArea({
    items: sourceItems,
    metrics
  });
  const fitResult = fitLayoutItemsToGrid({
    items: projection.layoutItems,
    metrics,
    sourceMetrics,
    contentSchemas,
    reservedArea,
    reservedItemIds: participants.map((participant) => participant.id)
  });

  if (!fitResult.valid) {
    return {
      valid: false,
      changed: false,
      items: sourceItems,
      reason: fitResult.reason,
      errors: fitResult.errors
    };
  }

  if (!fitResult.changed) {
    return {
      valid: true,
      changed: false,
      items: sourceItems,
      reason: null
    };
  }

  return {
    valid: true,
    changed: true,
    items: mergeScopedSceneItems({
      sourceItems,
      scopedSourceItems: projection.layoutItems,
      scopedResultItems: fitResult.items
    }),
    reason: null
  };
}
