// Area assistant tests
// Проверяет создание, валидацию и резолв одной области.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { AREA_ERRORS, createArea, resolveArea, validateArea } from "../area/index.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

assert.deepEqual(createArea({ x: "2.9", y: "3", w: "4px", h: 5.8 }), {
  x: 2,
  y: 3,
  w: 4,
  h: 5
});

assert.deepEqual(createArea({ x: -1, y: Number.NaN }), {
  x: 1,
  y: 1,
  w: 1,
  h: 1
});

assert.deepEqual(validateArea({ x: 1, y: 1, w: 2, h: 2 }), {
  valid: true,
  reason: null
});

assert.deepEqual(validateArea({ x: 1.5, y: 1, w: 1, h: 1 }), {
  valid: false,
  reason: AREA_ERRORS.INVALID_INTEGER
});

assert.deepEqual(validateArea({ x: 1, y: 1, w: 0, h: 1 }), {
  valid: false,
  reason: AREA_ERRORS.INVALID_SIZE
});

const resolved = resolveArea({ x: 2, y: 3, w: 4, h: 5 }, metrics);

assert.equal(resolved.valid, true);
assert.deepEqual(resolved.rect, {
  x: metrics.cellSize,
  y: metrics.cellSize * 2,
  width: metrics.cellSize * 4,
  height: metrics.cellSize * 5
});

const invalidResolved = resolveArea({ x: 1.5, y: 1, w: 1, h: 1 }, metrics);

assert.equal(invalidResolved.valid, false);
assert.equal(invalidResolved.error, AREA_ERRORS.INVALID_INTEGER);
assert.equal(invalidResolved.rect, null);

console.log("area assistant tests passed");
