// Layout-map assistant tests
// Проверяет карту отступов, соседей и осторожный responsive-пересчет.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/index.js";
import { defaultGridRules } from "../config/index.js";
import {
  createLayoutMap,
  LAYOUT_MAP_ERRORS,
  resolveResponsiveMap
} from "../layout-map/index.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

const fullWidth = { id: "full", x: 1, y: 1, w: metrics.columns, h: 2 };
const leftBlock = { id: "left", x: 2, y: 5, w: 2, h: 2 };
const rightBlock = { id: "right", x: 6, y: 5, w: 2, h: 2 };
const items = [fullWidth, leftBlock, rightBlock];

const result = createLayoutMap(items, metrics);
assert.equal(result.valid, true);
assert.equal(result.map.items.length, 3);

const fullMapItem = result.map.items.find((item) => item.id === "full");
assert.deepEqual(fullMapItem.edges, {
  left: 0,
  right: 0,
  top: 0,
  bottom: metrics.rows - 2
});
assert.equal(fullMapItem.anchors.left, true);
assert.equal(fullMapItem.anchors.right, true);

const leftRelation = result.map.relations.find(
  (relation) => relation.from === "left" && relation.type === "right-neighbor"
);
assert.equal(leftRelation.to, "right");
assert.equal(leftRelation.gap, 2);

const widerMetrics = {
  ...metrics,
  columns: metrics.columns + 6
};
const responsive = resolveResponsiveMap(result.map, widerMetrics);
assert.equal(responsive.valid, true);
assert.equal(responsive.items.find((item) => item.id === "full").w, metrics.columns + 6);
assert.equal(responsive.items.find((item) => item.id === "left").w, 2);

const invalidItems = createLayoutMap(null, metrics);
assert.equal(invalidItems.valid, false);
assert.equal(invalidItems.reason, LAYOUT_MAP_ERRORS.INVALID_ITEMS);

const invalidMetrics = createLayoutMap(items, null);
assert.equal(invalidMetrics.valid, false);
assert.equal(invalidMetrics.reason, LAYOUT_MAP_ERRORS.INVALID_METRICS);

console.log("layout map tests passed");
