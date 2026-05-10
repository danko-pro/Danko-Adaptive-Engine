import { OPERATION_TYPES } from "../../adaptive-engine/core/index.js";
import { applyEngineOperationCommand } from "./applyEngineOperationCommand.js";

export function renameAreaCommand({ item, value, items, metrics }) {
  if (!item) {
    return createLocalCommandError(items, "RENAME_TARGET_NOT_FOUND", "Блок для переименования не найден.");
  }

  const nextValue = String(value ?? "").trim();

  if (!nextValue) {
    return createLocalCommandError(items, "RENAME_VALUE_EMPTY", "Введите новое имя блока.");
  }

  return applyEngineOperationCommand({
    items,
    operation: {
      type: OPERATION_TYPES.SET_AREA,
      targetId: item.id,
      payload: {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h
      },
      meta: {
        ...(item.meta ?? {}),
        value: nextValue
      }
    },
    metrics
  });
}

function createLocalCommandError(items, code, message) {
  return {
    valid: false,
    items,
    selection: null,
    message,
    result: {
      report: {
        type: "rename-area",
        valid: false,
        changed: false,
        errors: [{ type: code }],
        errorsByType: { [code]: 1 }
      }
    }
  };
}
