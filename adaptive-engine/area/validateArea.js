// Area validator
// Проверяет только форму одной области. Границы конкретной сетки проверяет coordinates/layout слой.

import { AREA_ERRORS } from "./areaErrorCodes.js";

export function validateArea(area) {
  const values = [area?.x, area?.y, area?.w, area?.h];

  if (!values.every(Number.isFinite)) {
    return invalid(AREA_ERRORS.INVALID_NUMBERS);
  }

  if (!values.every(Number.isInteger)) {
    return invalid(AREA_ERRORS.INVALID_INTEGER);
  }

  if (area.w < 1 || area.h < 1) {
    return invalid(AREA_ERRORS.INVALID_SIZE);
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
