// Selection assistant tests
// Проверяет выбор cell/area по grid-координате.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import {
  resolveSelection,
  SELECTION_ERRORS,
  SELECTION_TYPES
} from "../selection/index.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);
const items = [
  { id: "a", x: 2, y: 2, w: 4, h: 4 },
  { id: "b", x: 10, y: 10, w: 2, h: 2 }
];

assert.deepEqual(resolveSelection({ cell: { x: 1, y: 1 }, items, metrics }), {
  valid: true,
  type: SELECTION_TYPES.CELL,
  cell: { x: 1, y: 1 },
  itemId: null,
  item: null,
  reason: null
});

const areaSelection = resolveSelection({ cell: { x: 3, y: 3 }, items, metrics });

assert.equal(areaSelection.type, SELECTION_TYPES.AREA);
assert.equal(areaSelection.itemId, "a");
assert.deepEqual(areaSelection.cell, { x: 3, y: 3 });

const topMostSelection = resolveSelection({
  cell: { x: 3, y: 3 },
  items: [
    { id: "bottom", x: 1, y: 1, w: 5, h: 5 },
    { id: "top", x: 3, y: 3, w: 2, h: 2 }
  ],
  metrics
});

assert.equal(topMostSelection.itemId, "top");

assert.deepEqual(resolveSelection({ cell: { x: metrics.columns + 1, y: 1 }, items, metrics }), {
  valid: false,
  type: SELECTION_TYPES.EMPTY,
  cell: { x: metrics.columns + 1, y: 1 },
  itemId: null,
  item: null,
  reason: SELECTION_ERRORS.OUT_OF_GRID
});

assert.deepEqual(resolveSelection({ cell: { x: 1.5, y: 1 }, items, metrics }), {
  valid: false,
  type: SELECTION_TYPES.EMPTY,
  cell: null,
  itemId: null,
  item: null,
  reason: SELECTION_ERRORS.INVALID_CELL
});

assert.deepEqual(resolveSelection({ cell: { x: 0, y: 1 }, items, metrics }), {
  valid: false,
  type: SELECTION_TYPES.EMPTY,
  cell: null,
  itemId: null,
  item: null,
  reason: SELECTION_ERRORS.INVALID_CELL
});

assert.deepEqual(resolveSelection({ cell: undefined, items, metrics }), {
  valid: false,
  type: SELECTION_TYPES.EMPTY,
  cell: null,
  itemId: null,
  item: null,
  reason: SELECTION_ERRORS.INVALID_CELL
});

assert.deepEqual(resolveSelection({ cell: { x: 1, y: 1 }, items: null, metrics }), {
  valid: true,
  type: SELECTION_TYPES.CELL,
  cell: { x: 1, y: 1 },
  itemId: null,
  item: null,
  reason: null
});

assert.deepEqual(resolveSelection({ cell: { x: 1, y: 1 }, items, metrics: null }), {
  valid: false,
  type: SELECTION_TYPES.EMPTY,
  cell: null,
  itemId: null,
  item: null,
  reason: SELECTION_ERRORS.INVALID_METRICS
});

console.log("selection tests passed");
