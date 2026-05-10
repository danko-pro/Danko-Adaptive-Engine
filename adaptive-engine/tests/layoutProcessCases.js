// Layout process tests
// Проверяет официальный pipeline layout-слоя.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { LAYOUT_ERRORS } from "../layout/layoutErrorCodes.js";
import { processLayoutItems } from "../layout/processLayoutItems.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

const validProcess = processLayoutItems(
  [
    { id: "a", x: "1", y: "1", w: "2", h: "2" },
    { id: "b", x: 3, y: 1, w: 2, h: 2 }
  ],
  metrics
);

assert.equal(validProcess.valid, true);
assert.equal(validProcess.items.length, 2);
assert.equal(validProcess.errors.length, 0);
assert.deepEqual(validProcess.report.summary, {
  total: 2,
  resolved: 2,
  errors: 0
});
assert.deepEqual(validProcess.meta, {
  received: 2,
  resolved: 2,
  errors: 0
});
assert.equal(validProcess.items[0].rect.width, metrics.cellSize * 2);

const invalidProcess = processLayoutItems(
  [
    { id: "a", x: 1, y: 1, w: 3, h: 3 },
    { id: "b", x: 2, y: 2, w: 1, h: 1 }
  ],
  metrics
);

assert.equal(invalidProcess.valid, false);
assert.deepEqual(invalidProcess.items, []);
assert.equal(invalidProcess.errors[0].type, LAYOUT_ERRORS.AREA_COLLISION);
assert.deepEqual(invalidProcess.report.summary, {
  total: 2,
  resolved: 0,
  errors: 1
});
assert.deepEqual(invalidProcess.meta, {
  received: 2,
  resolved: 0,
  errors: 1
});

const failedProcess = processLayoutItems([{ id: "a", x: 1, y: 1, w: 1, h: 1 }], null);

assert.equal(failedProcess.valid, false);
assert.deepEqual(failedProcess.items, []);
assert.equal(failedProcess.errors[0].type, LAYOUT_ERRORS.INVALID_METRICS);
assert.deepEqual(failedProcess.meta, {
  received: 1,
  resolved: 0,
  errors: 1
});

console.log("layout process tests passed");
