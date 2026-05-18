import { canPlaceArea } from "../../adaptive-engine/core/index.js";
import { createReservedAreaBlocks } from "./reservedAreaGeometry.js";

export function placeLayoutItems(candidates, metrics, { reservedArea = null } = {}) {
  const placed = [];
  const placedById = new Map();
  const reservedBlocks = createReservedAreaBlocks(reservedArea, metrics);
  const orderedCandidates = [...candidates].sort((left, right) => left.priority - right.priority);

  for (const candidate of orderedCandidates) {
    const occupiedItems = candidate.canUseReservedArea
      ? placed
      : [...placed, ...reservedBlocks];
    const area = canPlaceOrFindNearest(candidate.area, occupiedItems, metrics, candidate.minSize);
    const item = {
      ...candidate.area,
      ...area
    };

    placed.push(item);
    placedById.set(String(item.id), item);
  }

  return placedById;
}

function canPlaceOrFindNearest(area, placedItems, metrics, minSize) {
  const direct = canPlaceArea(area, placedItems, metrics);

  if (direct.canPlace) {
    return area;
  }

  const nearest = findNearestFreeArea(area, placedItems, metrics);

  if (nearest) {
    return nearest;
  }

  return findNearestFreeAreaWithShrink(area, placedItems, metrics, minSize) ?? area;
}

function findNearestFreeArea(area, placedItems, metrics) {
  let bestArea = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  const maxX = metrics.columns - area.w + 1;
  const maxY = metrics.rows - area.h + 1;

  for (let y = 1; y <= maxY; y += 1) {
    for (let x = 1; x <= maxX; x += 1) {
      const candidate = { ...area, x, y };
      const result = canPlaceArea(candidate, placedItems, metrics);

      if (!result.canPlace) {
        continue;
      }

      const distance = Math.abs(area.x - x) + Math.abs(area.y - y);

      if (distance < bestDistance) {
        bestArea = candidate;
        bestDistance = distance;
      }
    }
  }

  return bestArea;
}

function findNearestFreeAreaWithShrink(area, placedItems, metrics, minSize) {
  let bestArea = null;
  let bestScore = Number.POSITIVE_INFINITY;
  const minWidth = Math.min(Math.max(1, minSize.w), Math.min(area.w, metrics.columns));
  const minHeight = Math.min(Math.max(1, minSize.h), Math.min(area.h, metrics.rows));

  for (let width = Math.min(area.w, metrics.columns); width >= minWidth; width -= 1) {
    for (let height = Math.min(area.h, metrics.rows); height >= minHeight; height -= 1) {
      const resizedArea = {
        ...area,
        w: width,
        h: height,
        x: Math.min(area.x, metrics.columns - width + 1),
        y: Math.min(area.y, metrics.rows - height + 1)
      };
      const nearest = findNearestFreeArea(resizedArea, placedItems, metrics);

      if (!nearest) {
        continue;
      }

      const sizeLoss = (area.w - width) * 10 + (area.h - height) * 10;
      const distance = Math.abs(area.x - nearest.x) + Math.abs(area.y - nearest.y);
      const score = sizeLoss + distance;

      if (score < bestScore) {
        bestArea = nearest;
        bestScore = score;
      }
    }
  }

  return bestArea;
}
