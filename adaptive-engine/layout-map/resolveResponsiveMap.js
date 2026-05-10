// Пересчитывает блоки по карте позиционирования под новые размеры сетки.
// Пока это осторожная версия: она сохраняет размеры, но умеет тянуть блоки, закрепленные за двумя краями.

import { validateGridMetrics } from "../validators/index.js";
import { LAYOUT_MAP_ERRORS } from "./layoutMapErrorCodes.js";

export function resolveResponsiveMap(layoutMap, metrics) {
  const metricsValidation = validateGridMetrics(metrics);

  if (!metricsValidation.valid) {
    return {
      valid: false,
      reason: LAYOUT_MAP_ERRORS.INVALID_METRICS,
      metricsReason: metricsValidation.reason,
      items: []
    };
  }

  if (!layoutMap || !Array.isArray(layoutMap.items)) {
    return {
      valid: false,
      reason: LAYOUT_MAP_ERRORS.INVALID_ITEMS,
      items: []
    };
  }

  return {
    valid: true,
    reason: null,
    items: layoutMap.items.map((item) => resolveResponsiveItem(item, metrics))
  };
}

function resolveResponsiveItem(mapItem, metrics) {
  const nextItem = {
    ...mapItem.source,
    x: mapItem.x,
    y: mapItem.y,
    w: mapItem.w,
    h: mapItem.h
  };

  if (mapItem.anchors.left && mapItem.anchors.right) {
    nextItem.w = Math.max(1, metrics.columns - mapItem.edges.left - mapItem.edges.right);
  } else if (!mapItem.anchors.left && mapItem.anchors.right) {
    nextItem.x = Math.max(1, metrics.columns - mapItem.edges.right - mapItem.w + 1);
  }

  if (mapItem.anchors.top && mapItem.anchors.bottom) {
    nextItem.h = Math.max(1, metrics.rows - mapItem.edges.top - mapItem.edges.bottom);
  } else if (!mapItem.anchors.top && mapItem.anchors.bottom) {
    nextItem.y = Math.max(1, metrics.rows - mapItem.edges.bottom - mapItem.h + 1);
  }

  return nextItem;
}
