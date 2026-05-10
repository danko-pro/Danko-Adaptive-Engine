// Grid mode resolver
// Определяет режим сетки по уже рассчитанным метрикам и правилам.
// Ничего не меняет в геометрии: только называет состояние, чтобы debug и snapshot говорили одним языком.

import { GRID_AXIS_MODES, GRID_MODES } from "./gridModeNames.js";

export function resolveGridMode(metrics) {
  const horizontalMode = resolveAxisMode(
    metrics.columns,
    metrics.minColumns,
    metrics.minVisibleColumns,
    metrics.maxColumns
  );
  const verticalMode = resolveAxisMode(
    metrics.rows,
    metrics.minRows,
    metrics.minVisibleRows,
    metrics.maxRows
  );

  return {
    mode: resolveCombinedMode(
      horizontalMode,
      verticalMode,
      metrics.cellSize,
      metrics.minCellSize,
      metrics.maxCellSize
    ),
    horizontalMode,
    verticalMode
  };
}

function resolveAxisMode(value, baseMin, visibleMin, max) {
  if (value <= visibleMin) {
    return GRID_AXIS_MODES.MIN_LIMIT;
  }

  if (value >= max) {
    return GRID_AXIS_MODES.MAX_LIMIT;
  }

  if (value < baseMin) {
    return GRID_AXIS_MODES.COMPACT;
  }

  return GRID_AXIS_MODES.NORMAL;
}

function resolveCombinedMode(horizontalMode, verticalMode, cellSize, minCellSize, maxCellSize) {
  if (
    horizontalMode === GRID_AXIS_MODES.MIN_LIMIT ||
    verticalMode === GRID_AXIS_MODES.MIN_LIMIT ||
    cellSize <= minCellSize
  ) {
    return GRID_MODES.MINIMUM;
  }

  if (
    horizontalMode === GRID_AXIS_MODES.MAX_LIMIT ||
    verticalMode === GRID_AXIS_MODES.MAX_LIMIT ||
    cellSize >= maxCellSize
  ) {
    return GRID_MODES.MAXIMUM;
  }

  if (horizontalMode === GRID_AXIS_MODES.COMPACT && verticalMode === GRID_AXIS_MODES.COMPACT) {
    return GRID_MODES.COMPACT;
  }

  if (horizontalMode === GRID_AXIS_MODES.COMPACT) {
    return GRID_MODES.COMPACT_WIDTH;
  }

  if (verticalMode === GRID_AXIS_MODES.COMPACT) {
    return GRID_MODES.COMPACT_HEIGHT;
  }

  return GRID_MODES.NORMAL;
}
