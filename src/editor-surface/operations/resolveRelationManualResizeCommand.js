import {
  applyLayoutRelationManualAreaCommand,
  applyLayoutRelationProjectionCommand,
  normalizeArea,
  resolveLayoutRelationManualTarget,
  resolveSelectionAfterOperation
} from "../../../engine-adapter/index.js";

export function resolveRelationManualResizeCommand({
  items = [],
  item,
  metrics,
  sourceMetrics = metrics,
  nextArea
} = {}) {
  const manualTarget = resolveLayoutRelationManualTarget({
    items,
    itemId: item?.id,
    metrics
  });

  if (!manualTarget.shouldUseManualOverride) {
    return null;
  }

  const normalizedArea = normalizeArea(nextArea);

  if (!normalizedArea) {
    return createManualResizeErrorCommand({
      items,
      message: "Manual relation resize area is invalid."
    });
  }

  const manualCommand = applyLayoutRelationManualAreaCommand({
    items,
    parentId: manualTarget.parentId,
    childId: manualTarget.childId,
    viewportMode: manualTarget.viewportMode,
    area: normalizedArea
  });

  if (!manualCommand.ok) {
    return createManualResizeErrorCommand({
      items,
      message: manualCommand.message
    });
  }

  const projectionCommand = applyLayoutRelationProjectionCommand({
    items: manualCommand.data.items,
    metrics,
    sourceMetrics
  });

  return {
    command: createManualResizeSuccessCommand({
      items: manualCommand.data.items,
      itemId: String(item?.id ?? ""),
      metrics,
      message: manualCommand.message
    }),
    projection: projectionCommand.ok && projectionCommand.data.changed
      ? projectionCommand
      : null
  };
}

function createManualResizeSuccessCommand({ items, itemId, metrics, message }) {
  return {
    valid: true,
    changed: true,
    items,
    selection: resolveSelectionAfterOperation({ targetId: itemId }, items, metrics),
    message,
    result: {
      valid: true,
      report: {
        status: "ok",
        message
      }
    }
  };
}

function createManualResizeErrorCommand({ items, message }) {
  return {
    command: {
      valid: false,
      changed: false,
      items,
      selection: null,
      message,
      result: {
        valid: false,
        report: {
          status: "error",
          message
        }
      }
    },
    projection: null
  };
}
