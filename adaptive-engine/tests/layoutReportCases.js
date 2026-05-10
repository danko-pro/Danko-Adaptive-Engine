// Layout report tests
// Проверяет summary и группировку ошибок layout-отчета.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { createLayoutReport } from "../layout/createLayoutReport.js";
import { LAYOUT_ERRORS } from "../layout/layoutErrorCodes.js";
import { resolveLayoutItems } from "../layout/resolveLayoutItems.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

const validItems = [
  { id: "a", x: 1, y: 1, w: 2, h: 2 },
  { id: "b", x: 3, y: 1, w: 2, h: 2 }
];
const validResolve = resolveLayoutItems(validItems, metrics);

assert.deepEqual(createLayoutReport(validResolve, validItems), {
  valid: true,
  summary: {
    total: 2,
    resolved: 2,
    errors: 0
  },
  errorsByType: {},
  errors: []
});

const invalidItems = [
  { id: "a", x: 1, y: 1, w: 3, h: 3 },
  { id: "b", x: 2, y: 2, w: 1, h: 1 },
  { id: "c", x: metrics.columns, y: 1, w: 2, h: 1 }
];
const invalidResolve = resolveLayoutItems(invalidItems, metrics);
const invalidReport = createLayoutReport(invalidResolve, invalidItems);

assert.equal(invalidReport.valid, false);
assert.deepEqual(invalidReport.summary, {
  total: 3,
  resolved: 0,
  errors: 2
});
assert.equal(invalidReport.errorsByType[LAYOUT_ERRORS.AREA_COLLISION], 1);
assert.equal(invalidReport.errorsByType[LAYOUT_ERRORS.OUT_OF_GRID], 1);

console.log("layout report tests passed");
