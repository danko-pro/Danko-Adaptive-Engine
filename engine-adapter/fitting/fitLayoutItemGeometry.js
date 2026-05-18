import { clampAreaToGrid } from "../../adaptive-engine/core/index.js";

export function fitLayoutItemGeometry({ item, metrics, sourceMetrics = metrics }) {
  const edgeFittedItem = fitItemEdges(item, metrics, sourceMetrics);
  const sizeFittedItem = fitItemSize(edgeFittedItem, metrics);
  const result = clampAreaToGrid(sizeFittedItem, metrics);

  if (!result.valid) {
    return {
      valid: false,
      changed: false,
      item,
      reason: result.reason
    };
  }

  return {
    valid: true,
    changed:
      edgeFittedItem.x !== item.x ||
      edgeFittedItem.y !== item.y ||
      sizeFittedItem.w !== item.w ||
      sizeFittedItem.h !== item.h ||
      result.changed,
    item: {
      ...item,
      ...result.area
    },
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
