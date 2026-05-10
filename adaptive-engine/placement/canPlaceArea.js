// Placement assistant: canPlaceArea
// Проверяет, можно ли поставить область в текущий layout без выхода за сетку и collision.

import { validateGridArea } from "../coordinates/index.js";
import { detectAreaCollision } from "../layout/index.js";
import { validateGridMetrics } from "../validators/index.js";
import { PLACEMENT_ERRORS } from "./placementErrorCodes.js";

export function canPlaceArea(area, items = [], metrics) {
  const metricsValidation = validateGridMetrics(metrics);

  if (!metricsValidation.valid) {
    return blocked(PLACEMENT_ERRORS.INVALID_METRICS, {
      reason: metricsValidation.reason
    });
  }

  const areaValidation = validateGridArea(area, metrics);

  if (!areaValidation.valid) {
    return blocked(PLACEMENT_ERRORS.INVALID_AREA, {
      reason: areaValidation.reason
    });
  }

  const collision = findCollision(area, Array.isArray(items) ? items : []);

  if (collision) {
    return blocked(PLACEMENT_ERRORS.AREA_COLLISION, {
      itemId: collision.id ?? null
    });
  }

  return {
    valid: true,
    canPlace: true,
    reason: null,
    area,
    collision: null,
    details: {}
  };
}

function findCollision(area, items) {
  return items.find((item) => detectAreaCollision(area, item)) ?? null;
}

function blocked(reason, details = {}) {
  return {
    valid: false,
    canPlace: false,
    reason,
    area: null,
    collision: details.itemId ?? null,
    details
  };
}
