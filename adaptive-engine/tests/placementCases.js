// Placement assistant tests
// Проверяет возможность размещения области и поиск первого свободного места.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/index.js";
import { defaultGridRules } from "../config/index.js";
import { canPlaceArea, findFreeArea, PLACEMENT_ERRORS } from "../placement/index.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

const items = [
  { id: "a", x: 1, y: 1, w: 2, h: 2 },
  { id: "b", x: 5, y: 1, w: 2, h: 2 }
];

const free = canPlaceArea({ x: 3, y: 1, w: 2, h: 2 }, items, metrics);
assert.equal(free.valid, true);
assert.equal(free.canPlace, true);

const collision = canPlaceArea({ x: 2, y: 1, w: 2, h: 2 }, items, metrics);
assert.equal(collision.valid, false);
assert.equal(collision.canPlace, false);
assert.equal(collision.reason, PLACEMENT_ERRORS.AREA_COLLISION);
assert.equal(collision.collision, "a");

const outOfGrid = canPlaceArea({ x: metrics.columns, y: 1, w: 2, h: 1 }, items, metrics);
assert.equal(outOfGrid.valid, false);
assert.equal(outOfGrid.reason, PLACEMENT_ERRORS.INVALID_AREA);

const invalidMetrics = canPlaceArea({ x: 1, y: 1, w: 1, h: 1 }, items, null);
assert.equal(invalidMetrics.valid, false);
assert.equal(invalidMetrics.reason, PLACEMENT_ERRORS.INVALID_METRICS);

const firstFree = findFreeArea({ w: 2, h: 2 }, items, metrics);
assert.equal(firstFree.valid, true);
assert.equal(firstFree.found, true);
assert.deepEqual(firstFree.area, { x: 3, y: 1, w: 2, h: 2 });

const invalidSize = findFreeArea({ w: 0, h: 2 }, items, metrics);
assert.equal(invalidSize.valid, false);
assert.equal(invalidSize.found, false);
assert.equal(invalidSize.reason, "INVALID_SIZE");

console.log("placement tests passed");
