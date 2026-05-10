// Grid area validator
// Проверяет область в координатах x/y/w/h относительно текущих grid metrics.

import { AREA_ERRORS, validateArea } from "../area/index.js";
import { createGridCoordinateSystem } from "./createGridCoordinateSystem.js";
import { LAYOUT_ERRORS } from "../layout/layoutErrorCodes.js";

export const GRID_AREA_ERRORS = {
  INVALID_NUMBERS: AREA_ERRORS.INVALID_NUMBERS,
  INVALID_INTEGER: AREA_ERRORS.INVALID_INTEGER,
  INVALID_SIZE: AREA_ERRORS.INVALID_SIZE,
  OUT_OF_GRID: LAYOUT_ERRORS.OUT_OF_GRID
};

export function validateGridArea(area, metrics) {
  const areaValidation = validateArea(area);

  if (!areaValidation.valid) {
    return invalid(areaValidation.reason);
  }

  const coordinates = createGridCoordinateSystem(metrics);

  if (!coordinates.isAreaInside(area.x, area.y, area.w, area.h)) {
    return invalid(GRID_AREA_ERRORS.OUT_OF_GRID);
  }

  return {
    valid: true,
    reason: null
  };
}

function invalid(reason) {
  return {
    valid: false,
    reason
  };
}
