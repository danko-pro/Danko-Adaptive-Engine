// Layout resolve tests
// Проверяет подготовку валидных layout items к отображению через pixel rect.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { LAYOUT_ERRORS } from "../layout/layoutErrorCodes.js";
import { resolveLayoutItems } from "../layout/resolveLayoutItems.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

const resolved = resolveLayoutItems(
  [
    { id: "a", x: "1", y: "1", w: "2", h: "3" },
    { id: "b", x: 4, y: 1, w: 1, h: 1 }
  ],
  metrics
);

assert.equal(resolved.valid, true);
assert.deepEqual(resolved.errors, []);
assert.deepEqual(resolved.items[0], {
  id: "a",
  x: 1,
  y: 1,
  w: 2,
  h: 3,
  rect: {
    x: 0,
    y: 0,
    width: metrics.cellSize * 2,
    height: metrics.cellSize * 3
  }
});

const invalidResolved = resolveLayoutItems(
  [
    { id: "a", x: 1, y: 1, w: 3, h: 3 },
    { id: "b", x: 2, y: 2, w: 1, h: 1 }
  ],
  metrics
);

assert.equal(invalidResolved.valid, false);
assert.deepEqual(invalidResolved.items, []);
assert.equal(invalidResolved.errors[0].type, LAYOUT_ERRORS.AREA_COLLISION);

console.log("layout resolve tests passed");
