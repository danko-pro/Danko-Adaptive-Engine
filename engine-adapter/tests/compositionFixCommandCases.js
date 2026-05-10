import assert from "node:assert/strict";
import { applyCompositionFixCommand } from "../composition/applyCompositionFixCommand.js";

const sourceMetrics = createMetrics(75, 30);
const narrowMetrics = createMetrics(25, 30);

const command = applyCompositionFixCommand({
  items: [
    { id: "header", x: 1, y: 1, w: 75, h: 2, meta: { blockType: "header" } },
    { id: "content", x: 68, y: 4, w: 8, h: 5, meta: { blockType: "content" } }
  ],
  metrics: narrowMetrics,
  sourceMetrics,
  contentSchemas: {
    header: { type: "header" },
    content: { type: "content" }
  }
});

assert.equal(command.valid, true);
assert.equal(command.changed, true);
assert.equal(command.runtime.accepted, true);
assert.deepEqual(findItem(command.items, "header"), {
  id: "header",
  x: 1,
  y: 1,
  w: 25,
  h: 2,
  meta: { blockType: "header" }
});
assert.equal(findItem(command.items, "content").x, 18);

const noChangeCommand = applyCompositionFixCommand({
  items: [{ id: "content", x: 3, y: 3, w: 4, h: 2, meta: { blockType: "content" } }],
  metrics: narrowMetrics,
  sourceMetrics: narrowMetrics,
  contentSchemas: {
    content: { type: "content" }
  }
});

assert.equal(noChangeCommand.valid, true);
assert.equal(noChangeCommand.changed, false);

const crowdedCommand = applyCompositionFixCommand({
  items: [
    { id: "sidebar", x: 1, y: 3, w: 8, h: 20, meta: { blockType: "sidebar" } },
    { id: "content", x: 18, y: 3, w: 8, h: 20, meta: { blockType: "content" } },
    { id: "control", x: 20, y: 24, w: 8, h: 6, meta: { blockType: "control" } }
  ],
  metrics: createMetrics(12, 30),
  sourceMetrics: createMetrics(30, 30),
  contentSchemas: {
    sidebar: { type: "sidebar" },
    content: { type: "content" },
    control: { type: "control" }
  }
});

assert.equal(crowdedCommand.valid, true);
assert.equal(crowdedCommand.runtime.accepted, true);
assert.equal(crowdedCommand.runtime.geometry.valid, true);

console.log("adapter composition fix tests passed");

function createMetrics(columns, rows) {
  return {
    columns,
    rows,
    cellSize: 20,
    gridWidth: columns * 20,
    gridHeight: rows * 20
  };
}

function findItem(items, id) {
  return items.find((item) => item.id === id);
}
