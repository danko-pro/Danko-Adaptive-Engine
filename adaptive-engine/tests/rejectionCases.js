import {
  REJECTION_ERRORS,
  createRejection,
  explainRejection,
  resolveRejection
} from "../rejections/index.js";

const collision = createRejection({
  code: REJECTION_ERRORS.AREA_COLLISION,
  targetId: "editor",
  blockerId: "summary",
  canSuggest: true
});

assertEqual(collision.valid, false, "rejection is invalid result");
assertEqual(collision.rejected, true, "rejection is marked as rejected");
assertEqual(collision.canSuggest, true, "rejection can allow suggestion");

const message = explainRejection(REJECTION_ERRORS.AREA_COLLISION, {
  targetId: "editor",
  blockerId: "summary"
});
assertIncludes(message, "editor", "message includes target id");
assertIncludes(message, "summary", "message includes blocker id");

const resolved = resolveRejection({
  error: REJECTION_ERRORS.AREA_OUT_OF_BOUNDS,
  targetId: "cards"
});
assertEqual(resolved.code, REJECTION_ERRORS.AREA_OUT_OF_BOUNDS, "known error is preserved");
assertEqual(resolved.canSuggest, true, "out of bounds can suggest");
assertEqual(resolved.canAutoFix, false, "auto fix is off by default");

const unknown = resolveRejection({ error: "SOMETHING_ELSE" });
assertEqual(unknown.code, REJECTION_ERRORS.UNKNOWN_REJECTION, "unknown error is normalized");

console.log("rejection tests passed");

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertIncludes(value, part, message) {
  if (!String(value).includes(part)) {
    throw new Error(`${message}: expected ${value} to include ${part}`);
  }
}
