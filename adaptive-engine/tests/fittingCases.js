// Fitting assistant tests
// Проверяет подгонку area под границы grid без проверки collision.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/index.js";
import { defaultGridRules } from "../config/index.js";
import { clampAreaToGrid, FITTING_ERRORS } from "../fitting/index.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

const alreadyInside = clampAreaToGrid({ x: 2, y: 3, w: 4, h: 5 }, metrics);
assert.equal(alreadyInside.valid, true);
assert.equal(alreadyInside.changed, false);
assert.deepEqual(alreadyInside.area, { x: 2, y: 3, w: 4, h: 5 });

const leftTop = clampAreaToGrid({ x: -4, y: 0, w: 4, h: 5 }, metrics);
assert.equal(leftTop.valid, true);
assert.equal(leftTop.changed, true);
assert.deepEqual(leftTop.area, { x: 1, y: 1, w: 4, h: 5 });

const rightBottom = clampAreaToGrid(
  { x: metrics.columns + 10, y: metrics.rows + 10, w: 3, h: 4 },
  metrics
);
assert.equal(rightBottom.valid, true);
assert.equal(rightBottom.changed, true);
assert.deepEqual(rightBottom.area, {
  x: metrics.columns - 3 + 1,
  y: metrics.rows - 4 + 1,
  w: 3,
  h: 4
});

const invalidArea = clampAreaToGrid({ x: 1, y: 1, w: 0, h: 2 }, metrics);
assert.equal(invalidArea.valid, false);
assert.equal(invalidArea.reason, FITTING_ERRORS.INVALID_AREA);

const tooLarge = clampAreaToGrid({ x: 1, y: 1, w: metrics.columns + 1, h: 2 }, metrics);
assert.equal(tooLarge.valid, false);
assert.equal(tooLarge.reason, FITTING_ERRORS.AREA_TOO_LARGE);

const invalidMetrics = clampAreaToGrid({ x: 1, y: 1, w: 1, h: 1 }, null);
assert.equal(invalidMetrics.valid, false);
assert.equal(invalidMetrics.reason, FITTING_ERRORS.INVALID_METRICS);

console.log("fitting tests passed");
