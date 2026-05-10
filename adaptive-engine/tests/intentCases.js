import assert from "node:assert/strict";
import {
  INTENT_ERRORS,
  INTENT_TYPES,
  createAreaIntent,
  resolveAreaIntent,
  validateAreaIntent
} from "../intents/index.js";
import { OPERATION_TYPES } from "../operations/index.js";

const intent = createAreaIntent({
  cell: { x: "10", y: "6" },
  value: "1"
});

assert.equal(intent.type, INTENT_TYPES.CREATE_AREA_FROM_CELL);
assert.deepEqual(intent.cell, { x: 10, y: 6 });
assert.deepEqual(intent.size, { w: 1, h: 1 });
assert.equal(validateAreaIntent(intent).valid, true);

const resolved = resolveAreaIntent({
  cell: { x: 10, y: 6 },
  value: "1"
});

assert.equal(resolved.valid, true);
assert.equal(resolved.operation.type, OPERATION_TYPES.CREATE_AREA);
assert.equal(resolved.operation.targetId, "cell-10-6");
assert.deepEqual(resolved.operation.payload, {
  x: 10,
  y: 6,
  w: 1,
  h: 1
});
assert.deepEqual(resolved.operation.meta, {
  kind: "text",
  value: "1"
});

const resolvedWithMeta = resolveAreaIntent({
  targetId: "custom",
  cell: { x: 2, y: 3 },
  size: { w: 4, h: 5 },
  value: "Hello",
  meta: {
    kind: "label",
    source: "debug-ui"
  }
});

assert.equal(resolvedWithMeta.valid, true);
assert.equal(resolvedWithMeta.operation.targetId, "custom");
assert.deepEqual(resolvedWithMeta.operation.payload, {
  x: 2,
  y: 3,
  w: 4,
  h: 5
});
assert.deepEqual(resolvedWithMeta.operation.meta, {
  kind: "label",
  value: "Hello",
  source: "debug-ui"
});

const invalidCell = resolveAreaIntent({
  cell: { x: 0, y: 1 },
  value: "1"
});

assert.equal(invalidCell.valid, false);
assert.equal(invalidCell.errors[0].type, INTENT_ERRORS.INVALID_CELL);

const missingValue = resolveAreaIntent({
  cell: { x: 1, y: 1 }
});

assert.equal(missingValue.valid, false);
assert.equal(missingValue.errors[0].type, INTENT_ERRORS.MISSING_VALUE);

console.log("intent tests passed");
