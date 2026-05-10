// Grid metrics validation tests
// Проверяет явную валидацию metrics для layout pipeline.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { validateGridMetrics } from "../validators/validateGridMetrics.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

assert.deepEqual(validateGridMetrics(metrics), {
  valid: true,
  reason: null
});

assert.equal(validateGridMetrics(null).valid, false);
assert.equal(validateGridMetrics({ ...metrics, columns: Number.NaN }).valid, false);
assert.equal(validateGridMetrics({ ...metrics, rows: 0 }).valid, false);
assert.equal(validateGridMetrics({ ...metrics, cellSize: -1 }).valid, false);
assert.equal(validateGridMetrics({ ...metrics, gridWidth: 0 }).valid, false);

console.log("grid metrics validation tests passed");
