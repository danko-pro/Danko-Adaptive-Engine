import {
  applyLayoutRelationClearManualAreaCommand,
  applyLayoutRelationProjectionCommand
} from "../../../engine-adapter/index.js";

export function resolveRelationClearManualAreaCommand({
  items = [],
  parentId,
  childId,
  viewportMode,
  metrics,
  sourceMetrics = metrics
} = {}) {
  const clearCommand = applyLayoutRelationClearManualAreaCommand({
    items,
    parentId,
    childId,
    viewportMode
  });

  if (!clearCommand.ok) {
    return createClearErrorCommand({
      items,
      message: clearCommand.message
    });
  }

  const projectionCommand = applyLayoutRelationProjectionCommand({
    items: clearCommand.data.items,
    metrics,
    sourceMetrics
  });

  return {
    command: createClearSuccessCommand({
      items: clearCommand.data.items,
      parentId: clearCommand.data.parentId,
      childId: clearCommand.data.childId,
      viewportMode: clearCommand.data.viewportMode,
      message: clearCommand.message
    }),
    projection: projectionCommand.ok && projectionCommand.data.changed
      ? projectionCommand
      : null
  };
}

function createClearSuccessCommand({ items, parentId, childId, viewportMode, message }) {
  return {
    valid: true,
    changed: true,
    items,
    parentId,
    childId,
    viewportMode,
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

function createClearErrorCommand({ items, message }) {
  return {
    command: {
      valid: false,
      changed: false,
      items,
      parentId: null,
      childId: null,
      viewportMode: null,
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
