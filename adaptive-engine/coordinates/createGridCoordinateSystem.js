// Grid coordinate system
// Создает координатный API поверх уже рассчитанных grid metrics.

export function createGridCoordinateSystem(metrics) {
  const columns = metrics.columns;
  const rows = metrics.rows;
  const cellSize = metrics.cellSize;

  return {
    columns,
    rows,
    cellSize,
    getCellRect,
    getAreaRect,
    isCellInside,
    isAreaInside,
    getGridBounds
  };

  function getCellRect(x, y) {
    return getAreaRect(x, y, 1, 1);
  }

  function getAreaRect(x, y, w, h) {
    return {
      x: (x - 1) * cellSize,
      y: (y - 1) * cellSize,
      width: w * cellSize,
      height: h * cellSize
    };
  }

  function isCellInside(x, y) {
    return isAreaInside(x, y, 1, 1);
  }

  function isAreaInside(x, y, w, h) {
    return x >= 1 && y >= 1 && w >= 1 && h >= 1 && x + w - 1 <= columns && y + h - 1 <= rows;
  }

  function getGridBounds() {
    return {
      x: 0,
      y: 0,
      width: metrics.gridWidth,
      height: metrics.gridHeight
    };
  }
}
