// Валидация намерения области
// Проверяет, можно ли перевести намерение адаптера в operation.

import { INTENT_ERRORS } from "./intentErrorCodes.js";
import { INTENT_TYPES } from "./intentTypes.js";

export function validateAreaIntent(intent) {
  const errors = [];

  if (!intent || typeof intent !== "object") {
    return {
      valid: false,
      errors: [createIntentError(INTENT_ERRORS.INVALID_INTENT)]
    };
  }

  if (intent.type !== INTENT_TYPES.CREATE_AREA_FROM_CELL) {
    errors.push(createIntentError(INTENT_ERRORS.UNKNOWN_TYPE, { type: intent.type }));
  }

  if (!isPositiveInteger(intent.cell?.x) || !isPositiveInteger(intent.cell?.y)) {
    errors.push(createIntentError(INTENT_ERRORS.INVALID_CELL, { cell: intent.cell }));
  }

  if (!isPositiveInteger(intent.size?.w) || !isPositiveInteger(intent.size?.h)) {
    errors.push(createIntentError(INTENT_ERRORS.INVALID_SIZE, { size: intent.size }));
  }

  if (intent.value === null || intent.value === "") {
    errors.push(createIntentError(INTENT_ERRORS.MISSING_VALUE));
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function createIntentError(type, details = {}) {
  return {
    type,
    details
  };
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}
