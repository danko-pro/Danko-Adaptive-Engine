import assert from "node:assert/strict";
import { RUNTIME_STATUS, resolveRuntimeBridge } from "../index.js";

const metrics = {
  columns: 12,
  rows: 8,
  cellSize: 20,
  gridWidth: 240,
  gridHeight: 160
};

const readyBridge = resolveRuntimeBridge({
  metrics,
  items: [
    { id: "header", x: 1, y: 1, w: 12, h: 1 },
    { id: "content", x: 3, y: 3, w: 4, h: 3 }
  ],
  contentSchemas: {
    header: { type: "header" },
    content: { type: "content" }
  }
});

assert.equal(readyBridge.status, RUNTIME_STATUS.READY);
assert.equal(readyBridge.canApply, true);
assert.equal(readyBridge.geometry.valid, true);
assert.equal(readyBridge.composition.valid, true);

const overlapBridge = resolveRuntimeBridge({
  metrics,
  items: [
    { id: "first", x: 2, y: 2, w: 5, h: 4 },
    { id: "second", x: 4, y: 3, w: 5, h: 4 }
  ],
  contentSchemas: {
    first: { type: "content" },
    second: { type: "sidebar" }
  }
});

assert.equal(overlapBridge.status, RUNTIME_STATUS.BLOCKED_BY_COMPOSITION);
assert.equal(overlapBridge.canApply, false);
assert.equal(overlapBridge.geometry.valid, false);
assert.equal(overlapBridge.composition.valid, false);

const outOfGridBridge = resolveRuntimeBridge({
  metrics,
  items: [{ id: "wide-content", x: 8, y: 3, w: 8, h: 2 }],
  contentSchemas: {
    "wide-content": { type: "content" }
  }
});

assert.equal(outOfGridBridge.status, RUNTIME_STATUS.NEEDS_COMPOSITION_COMMAND);
assert.equal(outOfGridBridge.canApply, false);
assert.equal(outOfGridBridge.geometry.valid, false);
assert.equal(outOfGridBridge.composition.valid, true);

console.log("runtime bridge tests passed");
