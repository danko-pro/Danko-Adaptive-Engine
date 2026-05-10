import assert from "node:assert/strict";
import { RUNTIME_STATUS, resolveRuntimeCandidate } from "../index.js";

const metrics = {
  columns: 12,
  rows: 8,
  cellSize: 20,
  gridWidth: 240,
  gridHeight: 160
};

const acceptedCandidate = resolveRuntimeCandidate({
  metrics,
  items: [{ id: "content", x: 20, y: 3, w: 4, h: 2 }],
  candidateItems: [{ id: "content", x: 7, y: 3, w: 4, h: 2 }],
  contentSchemas: {
    content: { type: "content" }
  },
  strategy: "fit-to-grid"
});

assert.equal(acceptedCandidate.accepted, true);
assert.equal(acceptedCandidate.status, RUNTIME_STATUS.READY);
assert.deepEqual(acceptedCandidate.items, [{ id: "content", x: 7, y: 3, w: 4, h: 2 }]);

const rejectedCandidate = resolveRuntimeCandidate({
  metrics,
  items: [{ id: "content", x: 2, y: 3, w: 4, h: 2 }],
  candidateItems: [{ id: "content", x: 11, y: 3, w: 4, h: 2 }],
  contentSchemas: {
    content: { type: "content" }
  },
  strategy: "broken-candidate"
});

assert.equal(rejectedCandidate.accepted, false);
assert.equal(rejectedCandidate.status, RUNTIME_STATUS.BLOCKED_BY_GEOMETRY);
assert.deepEqual(rejectedCandidate.items, [{ id: "content", x: 2, y: 3, w: 4, h: 2 }]);
assert.equal(rejectedCandidate.reason, "geometry-rejected-candidate");

console.log("runtime candidate tests passed");
