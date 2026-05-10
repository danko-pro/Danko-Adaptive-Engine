import { findFreeArea, OPERATION_TYPES } from "../../adaptive-engine/core/index.js";
import { applyEngineOperationCommand } from "./applyEngineOperationCommand.js";

export function copyAreaCommand({ item, items, metrics }) {
  if (!item) {
    return createLocalCommandError(items, "COPY_TARGET_NOT_FOUND", "Блок для копирования не найден.");
  }

  const freeArea = findFreeArea({ w: item.w, h: item.h }, items, metrics);

  if (!freeArea.found) {
    return createLocalCommandError(items, freeArea.reason, "Свободное место для копии не найдено.");
  }

  return applyEngineOperationCommand({
    items,
    operation: {
      type: OPERATION_TYPES.CREATE_AREA,
      targetId: createCopyId(items, item),
      payload: freeArea.area,
      meta: { ...item.meta }
    },
    metrics
  });
}

function createCopyId(items, item) {
  const sourceId = String(item.id);
  let index = 1;
  let nextId = `${sourceId}-copy`;

  while (items.some((current) => String(current.id) === nextId)) {
    index += 1;
    nextId = `${sourceId}-copy-${index}`;
  }

  return nextId;
}

function createLocalCommandError(items, code, message) {
  return {
    valid: false,
    items,
    selection: null,
    message,
    result: {
      report: {
        type: "copy-area",
        valid: false,
        changed: false,
        errors: [{ type: code }],
        errorsByType: { [code]: 1 }
      }
    }
  };
}
