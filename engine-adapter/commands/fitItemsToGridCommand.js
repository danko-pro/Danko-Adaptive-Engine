import {
  canPlaceArea,
  clampAreaToGrid
} from "../../adaptive-engine/core/index.js";

// Минимальная страховка отображения при изменении размеров сетки.
// Это не responsive-layout: команда только строит временную проекцию,
// чтобы блоки не исчезали за границами текущей сетки и не накладывались друг на друга.
export function fitItemsToGridCommand({ items, metrics, sourceMetrics = metrics }) {
  const sourceItems = Array.isArray(items) ? items : [];
  const candidates = [];
  let changed = false;

  for (const item of sourceItems) {
    const edgeFittedItem = fitItemEdges(item, metrics, sourceMetrics);
    const sizeFittedItem = fitItemSize(edgeFittedItem, metrics);
    const result = clampAreaToGrid(sizeFittedItem, metrics);

    if (!result.valid) {
      return {
        valid: false,
        changed: false,
        items: sourceItems,
        reason: result.reason
      };
    }

    changed =
      changed ||
      edgeFittedItem.x !== item.x ||
      edgeFittedItem.y !== item.y ||
      sizeFittedItem.w !== item.w ||
      sizeFittedItem.h !== item.h ||
      result.changed;

    candidates.push({
      source: item,
      area: {
        ...item,
        ...result.area
      },
      priority: resolveProjectionPriority(item, sourceMetrics)
    });
  }

  const placedItems = placeWithoutCollision(candidates, metrics);
  const fittedItems = sourceItems.map((item) => placedItems.get(String(item.id)) ?? item);

  changed = changed || !areSameItems(sourceItems, fittedItems);

  if (!changed) {
    return {
      valid: true,
      changed: false,
      items: sourceItems,
      reason: null
    };
  }

  return {
    valid: true,
    changed: true,
    items: fittedItems,
    reason: null
  };
}

function fitItemEdges(item, metrics, sourceMetrics) {
  const sourceColumns = Number.isFinite(sourceMetrics?.columns)
    ? sourceMetrics.columns
    : metrics.columns;
  const sourceRows = Number.isFinite(sourceMetrics?.rows)
    ? sourceMetrics.rows
    : metrics.rows;
  const sourceRight = item.x + item.w - 1;
  const sourceBottom = item.y + item.h - 1;
  const touchesLeft = item.x <= 1;
  const touchesRight = sourceRight >= sourceColumns;
  const touchesTop = item.y <= 1;
  const touchesBottom = sourceBottom >= sourceRows;
  const nextItem = { ...item };

  if (touchesLeft && touchesRight) {
    nextItem.x = 1;
    nextItem.w = metrics.columns;
  } else if (touchesRight) {
    nextItem.x = metrics.columns - item.w + 1;
  }

  if (touchesTop && touchesBottom) {
    nextItem.y = 1;
    nextItem.h = metrics.rows;
  } else if (touchesBottom) {
    nextItem.y = metrics.rows - item.h + 1;
  }

  return nextItem;
}

function fitItemSize(item, metrics) {
  return {
    ...item,
    w: Math.min(item.w, metrics.columns),
    h: Math.min(item.h, metrics.rows)
  };
}

function resolveProjectionPriority(item, sourceMetrics) {
  const sourceColumns = Number.isFinite(sourceMetrics?.columns) ? sourceMetrics.columns : 0;
  const sourceRows = Number.isFinite(sourceMetrics?.rows) ? sourceMetrics.rows : 0;
  const touchesLeft = item.x <= 1;
  const touchesTop = item.y <= 1;
  const touchesRight = sourceColumns > 0 && item.x + item.w - 1 >= sourceColumns;
  const touchesBottom = sourceRows > 0 && item.y + item.h - 1 >= sourceRows;

  if ((touchesLeft && touchesRight) || (touchesTop && touchesBottom)) {
    return 0;
  }

  if (touchesLeft || touchesTop || touchesRight || touchesBottom) {
    return 2;
  }

  return 1;
}

function placeWithoutCollision(candidates, metrics) {
  const placed = [];
  const placedById = new Map();
  const orderedCandidates = [...candidates].sort((left, right) => left.priority - right.priority);

  for (const candidate of orderedCandidates) {
    const area = canPlaceOrFindNearest(candidate.area, placed, metrics);
    const item = {
      ...candidate.area,
      ...area
    };

    placed.push(item);
    placedById.set(String(item.id), item);
  }

  return placedById;
}

function canPlaceOrFindNearest(area, placedItems, metrics) {
  const direct = canPlaceArea(area, placedItems, metrics);

  if (direct.canPlace) {
    return area;
  }

  const nearest = findNearestFreeArea(area, placedItems, metrics);

  if (nearest) {
    return nearest;
  }

  return findNearestFreeAreaWithShrink(area, placedItems, metrics) ?? area;
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

function findNearestFreeAreaWithShrink(area, placedItems, metrics) {
  let bestArea = null;
  let bestScore = Number.POSITIVE_INFINITY;
  const minWidth = 1;
  const minHeight = 1;

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

function areSameItems(leftItems, rightItems) {
  if (leftItems.length !== rightItems.length) {
    return false;
  }

  return leftItems.every((leftItem, index) => {
    const rightItem = rightItems[index];

    return (
      String(leftItem.id) === String(rightItem.id) &&
      leftItem.x === rightItem.x &&
      leftItem.y === rightItem.y &&
      leftItem.w === rightItem.w &&
      leftItem.h === rightItem.h
    );
  });
}
