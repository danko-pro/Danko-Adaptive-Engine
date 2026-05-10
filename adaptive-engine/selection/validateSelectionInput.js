// Selection input validator
// Проверяет входные данные selection assistant до обращения к координатной системе.

import { validateGridMetrics } from "../validators/validateGridMetrics.js";
import { SELECTION_ERRORS } from "./selectionErrorCodes.js";

export function validateSelectionInput({ cell, metrics }) {
  const metricsValidation = validateGridMetrics(metrics);

  if (!metricsValidation.valid) {
    return invalid(SELECTION_ERRORS.INVALID_METRICS, {
      metricsReason: metricsValidation.reason
    });
  }

  const normalizedCell = normalizeCell(cell);

  if (!normalizedCell) {
    return invalid(SELECTION_ERRORS.INVALID_CELL);
  }

  return {
    valid: true,
    cell: normalizedCell,
    reason: null,
    details: {}
  };
}

function normalizeCell(cell) {
  const x = Number(cell?.x);
  const y = Number(cell?.y);

  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 1 || y < 1) {
    return null;
  }

  return { x, y };
}

function invalid(reason, details = {}) {
  return {
    valid: false,
    cell: null,
    reason,
    details
  };
}
