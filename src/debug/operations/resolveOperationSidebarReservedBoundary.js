import { SIDEBAR_DOCKS, resolveSidebarReservedArea } from "../../../sidebar-element/index.js";

export function resolveOperationSidebarReservedBoundary({ items = [], metrics = null } = {}) {
  const columns = Number(metrics?.columns);
  const rows = Number(metrics?.rows);
  const fallback = {
    boundaries: [],
    reservedArea: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    participants: [],
    valid: false
  };

  if (!Number.isFinite(columns) || !Number.isFinite(rows) || columns < 1 || rows < 1) {
    return fallback;
  }

  const { reservedArea, participants } = resolveSidebarReservedArea({ items, metrics });
  const boundaries = [];

  if (reservedArea.left > 0) {
    boundaries.push(createVerticalBoundary({
      id: SIDEBAR_DOCKS.LEFT,
      gridLine: reservedArea.left
    }));
  }

  if (reservedArea.right > 0) {
    boundaries.push(createVerticalBoundary({
      id: SIDEBAR_DOCKS.RIGHT,
      gridLine: columns - reservedArea.right
    }));
  }

  if (reservedArea.top > 0) {
    boundaries.push(createHorizontalBoundary({
      id: SIDEBAR_DOCKS.TOP,
      gridLine: reservedArea.top
    }));
  }

  if (reservedArea.bottom > 0) {
    boundaries.push(createHorizontalBoundary({
      id: SIDEBAR_DOCKS.BOTTOM,
      gridLine: rows - reservedArea.bottom
    }));
  }

  return {
    boundaries,
    reservedArea,
    participants,
    valid: true
  };
}

function createVerticalBoundary({ id, gridLine }) {
  return {
    id,
    orientation: "vertical",
    gridLine,
    style: {
      left: `calc(var(--cell-size) * ${gridLine})`
    }
  };
}

function createHorizontalBoundary({ id, gridLine }) {
  return {
    id,
    orientation: "horizontal",
    gridLine,
    style: {
      top: `calc(var(--cell-size) * ${gridLine})`
    }
  };
}
