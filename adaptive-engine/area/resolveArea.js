// Area resolver
// Резолвит одну область в pixel rect на основе текущих grid metrics.

import { createGridCoordinateSystem } from "../coordinates/createGridCoordinateSystem.js";
import { validateArea } from "./validateArea.js";

export function resolveArea(area, metrics) {
  const validation = validateArea(area);

  if (!validation.valid) {
    return {
      valid: false,
      area,
      rect: null,
      error: validation.reason
    };
  }

  const coordinates = createGridCoordinateSystem(metrics);

  return {
    valid: true,
    area,
    rect: coordinates.getAreaRect(area.x, area.y, area.w, area.h),
    error: null
  };
}
