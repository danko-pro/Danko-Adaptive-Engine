// Operation assistant tests
// Проверяет создание, валидацию и применение первой операции move-area.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { CONSTRAINT_ERRORS } from "../constraints/index.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { LAYOUT_ERRORS } from "../layout/layoutErrorCodes.js";
import {
  applyOperation,
  createOperation,
  OPERATION_ERRORS,
  OPERATION_TYPES,
  validateOperation
} from "../operations/index.js";
import { REJECTION_ERRORS } from "../rejections/index.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);

assert.deepEqual(createOperation({
  type: OPERATION_TYPES.MOVE_AREA,
  targetId: 12,
  payload: { x: 3, y: 4 }
}), {
  type: OPERATION_TYPES.MOVE_AREA,
  targetId: "12",
  payload: { x: 3, y: 4 },
  meta: {}
});

const invalidType = validateOperation({ type: "unknown", targetId: "a", payload: {} });
assert.equal(invalidType.valid, false);
assert.equal(invalidType.errors[0].type, OPERATION_ERRORS.UNKNOWN_TYPE);

const invalidPosition = validateOperation({
  type: OPERATION_TYPES.MOVE_AREA,
  targetId: "a",
  payload: { x: 0, y: 1 }
});
assert.equal(invalidPosition.valid, false);
assert.equal(invalidPosition.errors[0].type, OPERATION_ERRORS.INVALID_POSITION);

const invalidSize = validateOperation({
  type: OPERATION_TYPES.RESIZE_AREA,
  targetId: "a",
  payload: { w: 0, h: 2 }
});
assert.equal(invalidSize.valid, false);
assert.equal(invalidSize.errors[0].type, OPERATION_ERRORS.INVALID_SIZE);

const invalidCreate = validateOperation({
  type: OPERATION_TYPES.CREATE_AREA,
  targetId: "new",
  payload: { x: 1, y: 1, w: 0, h: 2 }
});
assert.equal(invalidCreate.valid, false);
assert.equal(invalidCreate.errors[0].type, OPERATION_ERRORS.INVALID_SIZE);

const invalidSetArea = validateOperation({
  type: OPERATION_TYPES.SET_AREA,
  targetId: "a",
  payload: { x: 1, y: 1, w: 0, h: 2 }
});
assert.equal(invalidSetArea.valid, false);
assert.equal(invalidSetArea.errors[0].type, OPERATION_ERRORS.INVALID_SIZE);

const sourceItems = [
  { id: "a", x: 1, y: 1, w: 2, h: 2 },
  { id: "b", x: 8, y: 8, w: 2, h: 2 }
];

const moved = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.MOVE_AREA, targetId: "a", payload: { x: 4, y: 5 } },
  metrics
);

assert.equal(moved.valid, true);
assert.equal(moved.rejected, false);
assert.equal(moved.action, OPERATION_TYPES.MOVE_AREA);
assert.equal(moved.rejection, null);
assert.deepEqual(moved.data.items, moved.items);
assert.deepEqual(moved.data.operation, moved.operation);
assert.equal(moved.items.find((item) => item.id === "a").x, 4);
assert.equal(moved.items.find((item) => item.id === "a").y, 5);
assert.equal(sourceItems.find((item) => item.id === "a").x, 1);
assert.deepEqual(moved.report, {
  valid: true,
  type: OPERATION_TYPES.MOVE_AREA,
  targetId: "a",
  rejected: false,
  rejectionCode: null,
  canSuggest: false,
  changed: true,
  beforeCount: 2,
  afterCount: 2,
  errors: 0,
  errorsByType: {}
});

const missingTarget = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.MOVE_AREA, targetId: "missing", payload: { x: 4, y: 5 } },
  metrics
);

assert.equal(missingTarget.valid, false);
assert.equal(missingTarget.rejected, true);
assert.equal(missingTarget.rejection.code, REJECTION_ERRORS.INVALID_OPERATION);
assert.equal(missingTarget.rejection.targetId, "missing");
assert.equal(missingTarget.errors[0].type, OPERATION_ERRORS.TARGET_NOT_FOUND);
assert.deepEqual(missingTarget.report.errorsByType, {
  [OPERATION_ERRORS.TARGET_NOT_FOUND]: 1
});

const collided = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.MOVE_AREA, targetId: "a", payload: { x: 8, y: 8 } },
  metrics
);

assert.equal(collided.valid, false);
assert.equal(collided.rejected, true);
assert.equal(collided.rejection.code, REJECTION_ERRORS.AREA_COLLISION);
assert.equal(collided.rejection.targetId, "a");
assert.equal(collided.rejection.blockerId, "b");
assert.equal(collided.report.rejected, true);
assert.equal(collided.report.rejectionCode, REJECTION_ERRORS.AREA_COLLISION);
assert.equal(collided.report.canSuggest, true);
assert.equal(collided.errors[0].type, LAYOUT_ERRORS.AREA_COLLISION);
assert.deepEqual(collided.items, sourceItems);
assert.equal(collided.report.changed, false);
assert.deepEqual(collided.report.errorsByType, {
  [LAYOUT_ERRORS.AREA_COLLISION]: 1
});

const resized = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.RESIZE_AREA, targetId: "a", payload: { w: 4, h: 3 } },
  metrics
);

assert.equal(resized.valid, true);
assert.equal(resized.items.find((item) => item.id === "a").w, 4);
assert.equal(resized.items.find((item) => item.id === "a").h, 3);
assert.equal(sourceItems.find((item) => item.id === "a").w, 2);

const setArea = applyOperation(
  [{ id: "a", x: 1, y: 1, w: 2, h: 2, meta: { value: "old" } }],
  {
    type: OPERATION_TYPES.SET_AREA,
    targetId: "a",
    payload: { x: 3, y: 4, w: 5, h: 6 },
    meta: { value: "new" }
  },
  metrics
);

assert.equal(setArea.valid, true);
assert.equal(setArea.action, OPERATION_TYPES.SET_AREA);
assert.deepEqual(setArea.items.find((item) => item.id === "a"), {
  id: "a",
  x: 3,
  y: 4,
  w: 5,
  h: 6,
  meta: { value: "new" }
});
assert.equal(sourceItems.find((item) => item.id === "a").x, 1);

const setAreaCollision = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.SET_AREA, targetId: "a", payload: { x: 8, y: 8, w: 2, h: 2 } },
  metrics
);

assert.equal(setAreaCollision.valid, false);
assert.equal(setAreaCollision.rejection.code, REJECTION_ERRORS.AREA_COLLISION);
assert.deepEqual(setAreaCollision.items, sourceItems);

const setAreaOutOfGrid = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.SET_AREA, targetId: "a", payload: { x: metrics.columns, y: 1, w: 2, h: 1 } },
  metrics
);

assert.equal(setAreaOutOfGrid.valid, false);
assert.equal(setAreaOutOfGrid.rejection.code, REJECTION_ERRORS.AREA_OUT_OF_BOUNDS);
assert.deepEqual(setAreaOutOfGrid.items, sourceItems);

const resizeCollision = applyOperation(
  [
    { id: "a", x: 1, y: 1, w: 2, h: 2 },
    { id: "b", x: 3, y: 1, w: 2, h: 2 }
  ],
  { type: OPERATION_TYPES.RESIZE_AREA, targetId: "a", payload: { w: 3, h: 2 } },
  metrics
);

assert.equal(resizeCollision.valid, false);
assert.equal(resizeCollision.rejection.code, REJECTION_ERRORS.AREA_COLLISION);
assert.equal(resizeCollision.errors[0].type, LAYOUT_ERRORS.AREA_COLLISION);

const resizeOutOfGrid = applyOperation(
  [{ id: "a", x: metrics.columns, y: 1, w: 1, h: 1 }],
  { type: OPERATION_TYPES.RESIZE_AREA, targetId: "a", payload: { w: 2, h: 1 } },
  metrics
);

assert.equal(resizeOutOfGrid.valid, false);
assert.equal(resizeOutOfGrid.rejection.code, REJECTION_ERRORS.AREA_OUT_OF_BOUNDS);
assert.equal(resizeOutOfGrid.errors[0].type, LAYOUT_ERRORS.OUT_OF_GRID);

const created = applyOperation(
  sourceItems,
  {
    type: OPERATION_TYPES.CREATE_AREA,
    targetId: "c",
    payload: { x: 12, y: 12, w: 3, h: 3 },
    meta: { value: "created" }
  },
  metrics
);

assert.equal(created.valid, true);
assert.equal(created.rejection, null);
assert.equal(created.items.length, 3);
assert.deepEqual(created.items.find((item) => item.id === "c"), {
  id: "c",
  x: 12,
  y: 12,
  w: 3,
  h: 3,
  meta: { value: "created" }
});
assert.equal(sourceItems.length, 2);

const createDuplicate = applyOperation(
  sourceItems,
  {
    type: OPERATION_TYPES.CREATE_AREA,
    targetId: "a",
    payload: { x: 12, y: 12, w: 3, h: 3 }
  },
  metrics
);

assert.equal(createDuplicate.valid, false);
assert.equal(createDuplicate.rejection.code, REJECTION_ERRORS.INVALID_AREA);
assert.equal(createDuplicate.errors[0].type, LAYOUT_ERRORS.DUPLICATE_ID);
assert.deepEqual(createDuplicate.items, sourceItems);

const createCollision = applyOperation(
  sourceItems,
  {
    type: OPERATION_TYPES.CREATE_AREA,
    targetId: "c",
    payload: { x: 1, y: 1, w: 2, h: 2 }
  },
  metrics
);

assert.equal(createCollision.valid, false);
assert.equal(createCollision.rejection.code, REJECTION_ERRORS.AREA_COLLISION);
assert.equal(createCollision.errors[0].type, LAYOUT_ERRORS.AREA_COLLISION);

const createOutOfGrid = applyOperation(
  sourceItems,
  {
    type: OPERATION_TYPES.CREATE_AREA,
    targetId: "c",
    payload: { x: metrics.columns, y: 1, w: 2, h: 1 }
  },
  metrics
);

assert.equal(createOutOfGrid.valid, false);
assert.equal(createOutOfGrid.rejection.code, REJECTION_ERRORS.AREA_OUT_OF_BOUNDS);
assert.equal(createOutOfGrid.errors[0].type, LAYOUT_ERRORS.OUT_OF_GRID);

const deleted = applyOperation(
  sourceItems,
  {
    type: OPERATION_TYPES.DELETE_AREA,
    targetId: "a"
  },
  metrics
);

assert.equal(deleted.valid, true);
assert.equal(deleted.rejection, null);
assert.equal(deleted.items.length, 1);
assert.equal(deleted.items[0].id, "b");
assert.equal(sourceItems.length, 2);
assert.equal(deleted.report.beforeCount, 2);
assert.equal(deleted.report.afterCount, 1);
assert.equal(deleted.report.changed, true);

const deleteMissing = applyOperation(
  sourceItems,
  {
    type: OPERATION_TYPES.DELETE_AREA,
    targetId: "missing"
  },
  metrics
);

assert.equal(deleteMissing.valid, false);
assert.equal(deleteMissing.rejection.code, REJECTION_ERRORS.INVALID_OPERATION);
assert.equal(deleteMissing.errors[0].type, OPERATION_ERRORS.TARGET_NOT_FOUND);

const lockedMoveByConstraint = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.MOVE_AREA, targetId: "a", payload: { x: 4, y: 5 } },
  metrics,
  {
    a: {
      id: "a",
      canMove: false
    }
  }
);

assert.equal(lockedMoveByConstraint.valid, false);
assert.equal(lockedMoveByConstraint.errors[0].type, CONSTRAINT_ERRORS.MOVE_LOCKED);
assert.equal(lockedMoveByConstraint.rejection.code, REJECTION_ERRORS.MOVE_LOCKED);
assert.deepEqual(lockedMoveByConstraint.items, sourceItems);

const lockedResizeByConstraint = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.RESIZE_AREA, targetId: "a", payload: { w: 4, h: 3 } },
  metrics,
  [
    {
      id: "a",
      canResize: false
    }
  ]
);

assert.equal(lockedResizeByConstraint.valid, false);
assert.equal(lockedResizeByConstraint.errors[0].type, CONSTRAINT_ERRORS.RESIZE_LOCKED);
assert.equal(lockedResizeByConstraint.rejection.code, REJECTION_ERRORS.RESIZE_LOCKED);

const lockedSetAreaMoveByConstraint = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.SET_AREA, targetId: "a", payload: { x: 4, y: 5, w: 2, h: 2 } },
  metrics,
  {
    a: {
      id: "a",
      canMove: false
    }
  }
);

assert.equal(lockedSetAreaMoveByConstraint.valid, false);
assert.equal(lockedSetAreaMoveByConstraint.errors[0].type, CONSTRAINT_ERRORS.MOVE_LOCKED);
assert.equal(lockedSetAreaMoveByConstraint.rejection.code, REJECTION_ERRORS.MOVE_LOCKED);

const lockedSetAreaResizeByConstraint = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.SET_AREA, targetId: "a", payload: { x: 1, y: 1, w: 4, h: 3 } },
  metrics,
  {
    a: {
      id: "a",
      canResize: false
    }
  }
);

assert.equal(lockedSetAreaResizeByConstraint.valid, false);
assert.equal(lockedSetAreaResizeByConstraint.errors[0].type, CONSTRAINT_ERRORS.RESIZE_LOCKED);
assert.equal(lockedSetAreaResizeByConstraint.rejection.code, REJECTION_ERRORS.RESIZE_LOCKED);

const tooSmallByConstraint = applyOperation(
  sourceItems,
  { type: OPERATION_TYPES.RESIZE_AREA, targetId: "a", payload: { w: 1, h: 1 } },
  metrics,
  {
    a: {
      id: "a",
      minW: 2,
      minH: 2
    }
  }
);

assert.equal(tooSmallByConstraint.valid, false);
assert.equal(tooSmallByConstraint.errors[0].type, CONSTRAINT_ERRORS.AREA_BELOW_MIN_SIZE);
assert.equal(tooSmallByConstraint.rejection.code, REJECTION_ERRORS.CONSTRAINT_VIOLATION);

const createBlockedByConstraint = applyOperation(
  sourceItems,
  {
    type: OPERATION_TYPES.CREATE_AREA,
    targetId: "c",
    payload: { x: 12, y: 12, w: 1, h: 1 }
  },
  metrics,
  {
    c: {
      id: "c",
      minW: 2,
      minH: 2
    }
  }
);

assert.equal(createBlockedByConstraint.valid, false);
assert.equal(createBlockedByConstraint.errors[0].type, CONSTRAINT_ERRORS.AREA_BELOW_MIN_SIZE);
assert.equal(createBlockedByConstraint.rejection.code, REJECTION_ERRORS.CONSTRAINT_VIOLATION);

console.log("operation tests passed");
