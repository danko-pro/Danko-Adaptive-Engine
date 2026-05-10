import assert from "node:assert/strict";
import { COMPOSITION_STATUS } from "../../composition-engine/index.js";
import { evaluateCompositionPlanCommand } from "../composition/evaluateCompositionPlanCommand.js";

const metrics = {
  columns: 12,
  rows: 8,
  cellSize: 20,
  gridWidth: 240,
  gridHeight: 160
};

const validCommand = evaluateCompositionPlanCommand({
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

assert.equal(validCommand.valid, true);
assert.equal(validCommand.status, COMPOSITION_STATUS.READY);

const warningCommand = evaluateCompositionPlanCommand({
  metrics,
  items: [
    { id: "header", x: 2, y: 3, w: 4, h: 1 },
    { id: "content", x: 1, y: 5, w: 3, h: 2 }
  ],
  contentSchemas: {
    header: { type: "header" },
    content: { type: "content" }
  }
});

assert.equal(warningCommand.valid, true);
assert.equal(warningCommand.status, COMPOSITION_STATUS.WARNING);

const errorCommand = evaluateCompositionPlanCommand({
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

assert.equal(errorCommand.valid, false);
assert.equal(errorCommand.status, COMPOSITION_STATUS.ERROR);

const policyWarningCommand = evaluateCompositionPlanCommand({
  metrics,
  policy: {
    spacing: {
      minGap: 1
    }
  },
  items: [
    { id: "left", x: 1, y: 3, w: 3, h: 2 },
    { id: "right", x: 4, y: 3, w: 3, h: 2 }
  ],
  contentSchemas: {
    left: { type: "content" },
    right: { type: "sidebar" }
  }
});

assert.equal(policyWarningCommand.valid, true);
assert.equal(policyWarningCommand.status, COMPOSITION_STATUS.WARNING);

console.log("adapter composition plan tests passed");
