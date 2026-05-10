import assert from "node:assert/strict";
import { detectAreaCollision } from "../../adaptive-engine/core/index.js";
import { fitItemsToGridCommand } from "../commands/fitItemsToGridCommand.js";

const sourceMetrics = createMetrics(75, 30);

const sourceItems = [
  { id: "full-width", x: 1, y: 1, w: 75, h: 2 },
  { id: "right-edge", x: 68, y: 8, w: 8, h: 5 },
  { id: "middle", x: 10, y: 6, w: 4, h: 4 }
];

const narrowResult = fitItemsToGridCommand({
  items: sourceItems,
  metrics: createMetrics(60, 30),
  sourceMetrics
});

assert.equal(narrowResult.valid, true);
assert.equal(narrowResult.changed, true);
assert.deepEqual(findItem(narrowResult.items, "full-width"), {
  id: "full-width",
  x: 1,
  y: 1,
  w: 60,
  h: 2
});
assert.deepEqual(findItem(narrowResult.items, "right-edge"), {
  id: "right-edge",
  x: 53,
  y: 8,
  w: 8,
  h: 5
});
assert.deepEqual(findItem(narrowResult.items, "middle"), {
  id: "middle",
  x: 10,
  y: 6,
  w: 4,
  h: 4
});

const wideResult = fitItemsToGridCommand({
  items: sourceItems,
  metrics: createMetrics(80, 30),
  sourceMetrics
});

assert.equal(wideResult.valid, true);
assert.equal(wideResult.changed, true);
assert.deepEqual(findItem(wideResult.items, "full-width"), {
  id: "full-width",
  x: 1,
  y: 1,
  w: 80,
  h: 2
});
assert.deepEqual(findItem(wideResult.items, "right-edge"), {
  id: "right-edge",
  x: 73,
  y: 8,
  w: 8,
  h: 5
});

assert.deepEqual(sourceItems, [
  { id: "full-width", x: 1, y: 1, w: 75, h: 2 },
  { id: "right-edge", x: 68, y: 8, w: 8, h: 5 },
  { id: "middle", x: 10, y: 6, w: 4, h: 4 }
]);

const crowdedResult = fitItemsToGridCommand({
  items: [
    { id: "full-width", x: 1, y: 1, w: 75, h: 2 },
    { id: "middle-wide", x: 13, y: 4, w: 13, h: 8 },
    { id: "right-edge", x: 68, y: 4, w: 8, h: 5 }
  ],
  metrics: createMetrics(25, 30),
  sourceMetrics
});

assert.equal(crowdedResult.valid, true);
assert.equal(hasCollisions(crowdedResult.items), false);
assert.deepEqual(findItem(crowdedResult.items, "full-width"), {
  id: "full-width",
  x: 1,
  y: 1,
  w: 25,
  h: 2
});
assert.deepEqual(findItem(crowdedResult.items, "middle-wide"), {
  id: "middle-wide",
  x: 13,
  y: 4,
  w: 13,
  h: 8
});

console.log("adapter fit-items tests passed");

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

function hasCollisions(items) {
  return items.some((item, index) =>
    items.slice(index + 1).some((nextItem) => detectAreaCollision(item, nextItem))
  );
}
