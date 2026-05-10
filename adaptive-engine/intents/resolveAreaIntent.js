// Разрешение намерения области
// Переводит нормализованное намерение адаптера в обычную operation движка.

import { OPERATION_TYPES } from "../operations/index.js";
import { createAreaIntent } from "./createAreaIntent.js";
import { validateAreaIntent } from "./validateAreaIntent.js";

export function resolveAreaIntent(input = {}) {
  const intent = createAreaIntent(input);
  const validation = validateAreaIntent(intent);

  if (!validation.valid) {
    return {
      valid: false,
      intent,
      operation: null,
      errors: validation.errors
    };
  }

  return {
    valid: true,
    intent,
    operation: {
      type: OPERATION_TYPES.CREATE_AREA,
      targetId: intent.targetId || createCellTargetId(intent.cell),
      payload: {
        x: intent.cell.x,
        y: intent.cell.y,
        w: intent.size.w,
        h: intent.size.h
      },
      meta: {
        kind: "text",
        value: intent.value,
        ...intent.meta
      }
    },
    errors: []
  };
}

function createCellTargetId(cell) {
  return `cell-${cell.x}-${cell.y}`;
}
