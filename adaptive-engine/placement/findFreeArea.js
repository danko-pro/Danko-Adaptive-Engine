// Placement assistant: findFreeArea
// Ищет первую свободную область указанного размера, двигаясь слева направо и сверху вниз.

import { canPlaceArea } from "./canPlaceArea.js";

export function findFreeArea(size, items = [], metrics) {
  const width = Number(size?.w);
  const height = Number(size?.h);

  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    return {
      valid: false,
      found: false,
      area: null,
      reason: "INVALID_SIZE"
    };
  }

  for (let y = 1; y <= metrics.rows - height + 1; y += 1) {
    for (let x = 1; x <= metrics.columns - width + 1; x += 1) {
      const area = { x, y, w: width, h: height };
      const result = canPlaceArea(area, items, metrics);

      if (result.canPlace) {
        return {
          valid: true,
          found: true,
          area,
          reason: null
        };
      }
    }
  }

  return {
    valid: true,
    found: false,
    area: null,
    reason: "NO_FREE_AREA"
  };
}
