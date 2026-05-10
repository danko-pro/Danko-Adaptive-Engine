import {
  CONSTRAINT_ERRORS,
  createConstraint,
  resolveConstraint,
  validateConstraint
} from "../constraints/index.js";

const constraint = createConstraint({
  id: "editor",
  minW: 4,
  minH: 3,
  maxW: 10,
  maxH: 8
});

assertEqual(constraint.minW, 4, "createConstraint keeps minW");
assertEqual(validateConstraint(constraint).valid, true, "constraint is valid");

const tooSmall = resolveConstraint({ id: "area", x: 1, y: 1, w: 2, h: 2 }, constraint);
assertEqual(tooSmall.valid, false, "too small area is rejected");
assertEqual(tooSmall.changed, true, "too small area is clamped");
assertEqual(tooSmall.area.w, 4, "width is clamped to minW");
assertEqual(tooSmall.error, CONSTRAINT_ERRORS.AREA_BELOW_MIN_SIZE, "too small error is reported");

const lockedMove = resolveConstraint(
  { id: "area", x: 1, y: 1, w: 5, h: 4 },
  { ...constraint, canMove: false, nextX: 2 }
);
assertEqual(lockedMove.valid, false, "locked move is rejected");
assertEqual(lockedMove.error, CONSTRAINT_ERRORS.MOVE_LOCKED, "locked move error is reported");

const tooLargeNextArea = resolveConstraint(
  { id: "area", x: 1, y: 1, w: 5, h: 4 },
  { ...constraint, nextArea: { id: "area", x: 1, y: 1, w: 12, h: 4 } }
);
assertEqual(tooLargeNextArea.valid, false, "too large next area is rejected");
assertEqual(tooLargeNextArea.area.w, 10, "width is clamped to maxW");
assertEqual(tooLargeNextArea.error, CONSTRAINT_ERRORS.AREA_ABOVE_MAX_SIZE, "too large error is reported");

console.log("constraint tests passed");

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}
