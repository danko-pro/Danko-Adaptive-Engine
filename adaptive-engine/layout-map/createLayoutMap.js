// Создает карту позиционирования.
// Карта фиксирует не только x/y/w/h, но и расстояния блока до краев сетки.

import { normalizeLayoutItems } from "../layout/index.js";
import { validateGridMetrics } from "../validators/index.js";
import { detectItemRelations } from "./detectItemRelations.js";
import { LAYOUT_MAP_ERRORS } from "./layoutMapErrorCodes.js";

export function createLayoutMap(items, metrics) {
  const metricsValidation = validateGridMetrics(metrics);

  if (!metricsValidation.valid) {
    return {
      valid: false,
      reason: LAYOUT_MAP_ERRORS.INVALID_METRICS,
      metricsReason: metricsValidation.reason,
      map: null
    };
  }

  if (!Array.isArray(items)) {
    return {
      valid: false,
      reason: LAYOUT_MAP_ERRORS.INVALID_ITEMS,
      map: null
    };
  }

  const mapItems = normalizeLayoutItems(items).map((item) => createMapItem(item, metrics));

  return {
    valid: true,
    reason: null,
    map: {
      columns: metrics.columns,
      rows: metrics.rows,
      items: mapItems,
      relations: detectItemRelations(mapItems)
    }
  };
}

function createMapItem(item, metrics) {
  const right = metrics.columns - (item.x + item.w - 1);
  const bottom = metrics.rows - (item.y + item.h - 1);

  return {
    id: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    edges: {
      left: item.x - 1,
      right,
      top: item.y - 1,
      bottom
    },
    center: {
      x: item.x + (item.w - 1) / 2,
      y: item.y + (item.h - 1) / 2
    },
    anchors: inferAnchors({
      left: item.x - 1,
      right,
      top: item.y - 1,
      bottom
    }),
    source: item
  };
}

function inferAnchors(edges) {
  return {
    left: edges.left === 0,
    right: edges.right === 0,
    top: edges.top === 0,
    bottom: edges.bottom === 0
  };
}
