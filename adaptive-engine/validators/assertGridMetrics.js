// Grid metrics assertions
// Проверяет инварианты результата. Используется тестами и может применяться в debug-режиме.

export function assertGridMetrics(metrics) {
  assert(typeof metrics.engineVersion === "string", "engineVersion is missing");
  assertFinite(metrics.columns, "columns");
  assertFinite(metrics.rows, "rows");
  assertFinite(metrics.cellSize, "cellSize");
  assertFinite(metrics.gridWidth, "gridWidth");
  assertFinite(metrics.gridHeight, "gridHeight");

  assert(metrics.columns >= metrics.minVisibleColumns, "columns below minVisibleColumns");
  assert(metrics.columns <= metrics.maxColumns, "columns above maxColumns");
  assert(metrics.rows >= metrics.minVisibleRows, "rows below minVisibleRows");
  assert(metrics.rows <= metrics.maxRows, "rows above maxRows");
  assert(metrics.cellSize >= metrics.minCellSize, "cellSize below minCellSize");
  assert(metrics.cellSize <= metrics.maxCellSize, "cellSize above maxCellSize");

  assertEqualPixels(metrics.gridWidth, metrics.columns * metrics.cellSize, "gridWidth");
  assertEqualPixels(metrics.gridHeight, metrics.rows * metrics.cellSize, "gridHeight");
  assert(metrics.debug && typeof metrics.debug.mode === "string", "debug mode is missing");

  assertCssVariable(metrics.cssVariables, "--columns");
  assertCssVariable(metrics.cssVariables, "--rows");
  assertCssVariable(metrics.cssVariables, "--cell-size");
  assertCssVariable(metrics.cssVariables, "--grid-width");
  assertCssVariable(metrics.cssVariables, "--grid-height");

  return true;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Grid metrics invariant failed: ${message}`);
  }
}

function assertFinite(value, name) {
  assert(Number.isFinite(value), `${name} is not finite`);
}

function assertEqualPixels(actual, expected, name) {
  const roundedExpected = Math.round(expected * 100) / 100;
  assert(Math.abs(actual - roundedExpected) < 0.001, `${name} has invalid geometry`);
}

function assertCssVariable(cssVariables, name) {
  assert(cssVariables && Object.prototype.hasOwnProperty.call(cssVariables, name), `${name} is missing`);
}
