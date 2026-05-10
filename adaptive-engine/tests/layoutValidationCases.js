// Layout validation tests
// Проверяет набор layout-областей: id, выход за границы и пересечения.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { detectAreaCollision } from "../layout/detectAreaCollision.js";
import { createLayoutError } from "../layout/createLayoutError.js";
import { normalizeLayoutItem } from "../layout/normalizeLayoutItem.js";
import { normalizeLayoutItems } from "../layout/normalizeLayoutItems.js";
import { prepareLayoutItems } from "../layout/prepareLayoutItems.js";
import { LAYOUT_ERRORS, validateLayoutItems } from "../layout/validateLayoutItems.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

assert.deepEqual(normalizeLayoutItem({ id: 42, x: "2.9", y: "3", w: "4px", h: 5.8 }), {
  id: "42",
  x: 2,
  y: 3,
  w: 4,
  h: 5
});

assert.deepEqual(normalizeLayoutItem({ id: "  a  ", x: -10, y: Number.NaN }), {
  id: "a",
  x: 1,
  y: 1,
  w: 1,
  h: 1
});

assert.deepEqual(normalizeLayoutItems(null), []);

assert.equal(
  detectAreaCollision({ x: 1, y: 1, w: 2, h: 2 }, { x: 3, y: 1, w: 2, h: 2 }),
  false
);

assert.equal(
  detectAreaCollision({ x: 1, y: 1, w: 2, h: 2 }, { x: 2, y: 2, w: 2, h: 2 }),
  true
);

assert.equal(
  detectAreaCollision({ x: 1, y: 1, w: 2, h: 2 }, { x: 1, y: 3, w: 2, h: 2 }),
  false
);

assert.equal(
  detectAreaCollision({ x: 1, y: 1, w: 5, h: 5 }, { x: 2, y: 2, w: 1, h: 1 }),
  true
);

assert.deepEqual(
  validateLayoutItems(
    [
      { id: "a", x: 1, y: 1, w: 2, h: 2 },
      { id: "b", x: 3, y: 1, w: 2, h: 2 }
    ],
    metrics
  ),
  { valid: true, errors: [] }
);

assert.deepEqual(
  validateLayoutItems(
    normalizeLayoutItems([
      { id: "a", x: "1", y: "1", w: "2", h: "2" },
      { id: "b", x: "3", y: "1", w: "2", h: "2" }
    ]),
    metrics
  ),
  { valid: true, errors: [] }
);

assert.deepEqual(validateLayoutItems([{ x: 1, y: 1, w: 1, h: 1 }], metrics), {
  valid: false,
  errors: [
    createLayoutError(LAYOUT_ERRORS.MISSING_ID, {
      details: { item: { x: 1, y: 1, w: 1, h: 1 } }
    })
  ]
});

assert.deepEqual(
  validateLayoutItems(
    [
      { id: "a", x: 1, y: 1, w: 1, h: 1 },
      { id: "a", x: 2, y: 1, w: 1, h: 1 }
    ],
    metrics
  ),
  { valid: false, errors: [createLayoutError(LAYOUT_ERRORS.DUPLICATE_ID, { itemId: "a" })] }
);

assert.deepEqual(validateLayoutItems([{ id: "a", x: metrics.columns, y: 1, w: 2, h: 1 }], metrics), {
  valid: false,
  errors: [createLayoutError(LAYOUT_ERRORS.OUT_OF_GRID, { itemId: "a" })]
});

assert.deepEqual(
  validateLayoutItems(
    [
      { id: "a", x: 1, y: 1, w: 3, h: 3 },
      { id: "b", x: 3, y: 3, w: 2, h: 2 }
    ],
    metrics
  ),
  {
    valid: false,
    errors: [createLayoutError(LAYOUT_ERRORS.AREA_COLLISION, { itemIds: ["a", "b"] })]
  }
);

assert.deepEqual(
  prepareLayoutItems(
    [
      { id: "a", x: "1", y: "1", w: "2", h: "2" },
      { id: "b", x: "3", y: "1", w: "2", h: "2" }
    ],
    metrics
  ),
  {
    items: [
      { id: "a", x: 1, y: 1, w: 2, h: 2 },
      { id: "b", x: 3, y: 1, w: 2, h: 2 }
    ],
    validation: { valid: true, errors: [] }
  }
);

console.log("layout validation tests passed");
