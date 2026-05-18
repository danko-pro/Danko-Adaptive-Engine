import { SIDEBAR_DOCKS, resolveSidebarDock } from "../contracts/sidebarDock.js";

export function resolveSidebarDockFromArea({
  area,
  metrics,
  fallbackDock = SIDEBAR_DOCKS.LEFT
} = {}) {
  if (!isAreaLike(area) || !isMetricsLike(metrics)) {
    return resolveSidebarDock(fallbackDock);
  }

  const x = Number(area.x);
  const y = Number(area.y);
  const w = Number(area.w);
  const h = Number(area.h);
  const right = x + w - 1;
  const bottom = y + h - 1;
  const columns = Number(metrics.columns);
  const rows = Number(metrics.rows);
  const distances = [
    { dock: SIDEBAR_DOCKS.LEFT, distance: Math.abs(x - 1), rank: 0 },
    { dock: SIDEBAR_DOCKS.RIGHT, distance: Math.abs(columns - right), rank: 1 },
    { dock: SIDEBAR_DOCKS.TOP, distance: Math.abs(y - 1), rank: 2 },
    { dock: SIDEBAR_DOCKS.BOTTOM, distance: Math.abs(rows - bottom), rank: 3 }
  ].sort((left, rightItem) => {
    if (left.distance !== rightItem.distance) {
      return left.distance - rightItem.distance;
    }

    return left.rank - rightItem.rank;
  });

  return distances[0]?.dock ?? resolveSidebarDock(fallbackDock);
}

function isAreaLike(area) {
  return (
    area &&
    Number.isFinite(Number(area.x)) &&
    Number.isFinite(Number(area.y)) &&
    Number.isFinite(Number(area.w)) &&
    Number.isFinite(Number(area.h)) &&
    Number(area.w) > 0 &&
    Number(area.h) > 0
  );
}

function isMetricsLike(metrics) {
  return (
    metrics &&
    Number.isFinite(Number(metrics.columns)) &&
    Number.isFinite(Number(metrics.rows)) &&
    Number(metrics.columns) > 0 &&
    Number(metrics.rows) > 0
  );
}
