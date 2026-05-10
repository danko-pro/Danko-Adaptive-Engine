// Grid coordinate tests
// Проверяет координатную систему x/y/w/h поверх рассчитанных metrics.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { createGridCoordinateSystem } from "../coordinates/createGridCoordinateSystem.js";
import { GRID_AREA_ERRORS, validateGridArea } from "../coordinates/validateGridArea.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);
const coordinates = createGridCoordinateSystem(metrics);

assert.deepEqual(coordinates.getCellRect(1, 1), {
  x: 0,
  y: 0,
  width: metrics.cellSize,
  height: metrics.cellSize
});

assert.deepEqual(coordinates.getAreaRect(2, 3, 4, 5), {
  x: metrics.cellSize,
  y: metrics.cellSize * 2,
  width: metrics.cellSize * 4,
  height: metrics.cellSize * 5
});

assert.equal(coordinates.isCellInside(1, 1), true);
assert.equal(coordinates.isCellInside(metrics.columns, metrics.rows), true);
assert.equal(coordinates.isCellInside(0, 1), false);
assert.equal(coordinates.isCellInside(1, 0), false);
assert.equal(coordinates.isCellInside(metrics.columns + 1, 1), false);
assert.equal(coordinates.isCellInside(1, metrics.rows + 1), false);

assert.deepEqual(validateGridArea({ x: 1, y: 1, w: 2, h: 2 }, metrics), {
  valid: true,
  reason: null
});

assert.deepEqual(validateGridArea({ x: metrics.columns, y: 1, w: 2, h: 1 }, metrics), {
  valid: false,
  reason: GRID_AREA_ERRORS.OUT_OF_GRID
});

assert.deepEqual(validateGridArea({ x: 1, y: 1, w: 0, h: 1 }, metrics), {
  valid: false,
  reason: GRID_AREA_ERRORS.INVALID_SIZE
});

assert.deepEqual(validateGridArea({ x: 1.5, y: 1, w: 1, h: 1 }, metrics), {
  valid: false,
  reason: GRID_AREA_ERRORS.INVALID_INTEGER
});

assert.deepEqual(validateGridArea({ x: Number.NaN, y: 1, w: 1, h: 1 }, metrics), {
  valid: false,
  reason: GRID_AREA_ERRORS.INVALID_NUMBERS
});

console.log("grid coordinate tests passed");
