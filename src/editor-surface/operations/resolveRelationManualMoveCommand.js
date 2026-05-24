import {
  applyLayoutRelationManualAreaCommand,
  applyLayoutRelationProjectionCommand,
  normalizeArea,
  resolveLayoutRelationManualTarget,
  resolveSelectionAfterOperation
} from "../../../engine-adapter/index.js";

export function resolveRelationManualMoveCommand({
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
    return createManualMoveErrorCommand({
      items,
      message: "Manual relation move area is invalid."
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
    return createManualMoveErrorCommand({
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
    command: createManualMoveSuccessCommand({
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

function createManualMoveSuccessCommand({ items, itemId, metrics, message }) {
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

function createManualMoveErrorCommand({ items, message }) {
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
