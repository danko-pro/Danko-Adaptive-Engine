// Fitting assistant: clampAreaToGrid
// Сдвигает область внутрь сетки, сохраняя ее размер. Collision этот слой не проверяет.

import { validateArea } from "../area/index.js";
import { validateGridMetrics } from "../validators/index.js";
import { FITTING_ERRORS } from "./fittingErrorCodes.js";

export function clampAreaToGrid(area, metrics) {
  const metricsValidation = validateGridMetrics(metrics);

  if (!metricsValidation.valid) {
    return blocked(FITTING_ERRORS.INVALID_METRICS, {
      reason: metricsValidation.reason
    });
  }

  const areaValidation = validateArea(area);

  if (!areaValidation.valid) {
    return blocked(FITTING_ERRORS.INVALID_AREA, {
      reason: areaValidation.reason
    });
  }

  if (area.w > metrics.columns || area.h > metrics.rows) {
    return blocked(FITTING_ERRORS.AREA_TOO_LARGE, {
      columns: metrics.columns,
      rows: metrics.rows
    });
  }

  const maxX = metrics.columns - area.w + 1;
  const maxY = metrics.rows - area.h + 1;
  const nextArea = {
    ...area,
    x: clamp(area.x, 1, maxX),
    y: clamp(area.y, 1, maxY)
  };

  return {
    valid: true,
    changed: nextArea.x !== area.x || nextArea.y !== area.y,
    area: nextArea,
    reason: null,
    details: {}
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function blocked(reason, details = {}) {
  return {
    valid: false,
    changed: false,
    area: null,
    reason,
    details
  };
}
