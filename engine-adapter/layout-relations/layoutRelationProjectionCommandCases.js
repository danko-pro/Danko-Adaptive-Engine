import assert from "node:assert/strict";
import { ADAPTER_STATUS } from "../contracts/adapterStatus.js";
import { LAYOUT_RELATION_CHILD_KINDS } from "./layoutRelationContracts.js";
import { applyLayoutRelationProjectionCommand } from "./applyLayoutRelationProjectionCommand.js";

const desktopMetrics = createMetrics(64, 32);
const narrowMetrics = createMetrics(40, 32, { horizontalMode: "compact" });
const mobileMetrics = createMetrics(22, 32, { horizontalMode: "min-limit" });

const relationItems = [
  {
    id: "parent",
    x: 2,
    y: 2,
    w: 18,
    h: 6,
    meta: {
      layoutRelations: {
        children: [
          { id: "child-b", order: 2 },
          { id: "child-a", order: 1 },
          { id: "missing-child" },
          {
            id: "internal-child",
            kind: LAYOUT_RELATION_CHILD_KINDS.INTERNAL_CONTENT_ITEM
          }
        ]
      }
    }
  },
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 },
  { id: "child-b", x: 8, y: 20, w: 24, h: 3 },
  { id: "internal-child", x: 20, y: 1, w: 2, h: 2 },
  { id: "solo", x: 1, y: 26, w: 8, h: 4 }
];

const relationItemsBefore = structuredClone(relationItems);

const desktopResult = applyLayoutRelationProjectionCommand({
  items: relationItems,
  metrics: desktopMetrics,
  sourceMetrics: desktopMetrics
});

assertAdapterShape(desktopResult);
assert.equal(desktopResult.status, ADAPTER_STATUS.OK);
assert.equal(desktopResult.ok, true);
assert.equal(desktopResult.data.changed, false);
assert.equal(desktopResult.data.items, relationItems);
assert.deepEqual(
  desktopResult.data.items.map(pickGeometry),
  relationItems.map(pickGeometry)
);

const narrowResult = applyLayoutRelationProjectionCommand({
  items: relationItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assertAdapterShape(narrowResult);
assert.equal(narrowResult.status, ADAPTER_STATUS.OK);
assert.equal(narrowResult.data.changed, true);
assert.notEqual(narrowResult.data.items, relationItems);
assert.deepEqual(pickGeometry(findItem(narrowResult.data.items, "parent")), pickGeometry(relationItems[0]));
assert.deepEqual(pickGeometry(findItem(narrowResult.data.items, "child-a")), {
  x: 2,
  y: 9,
  w: 18,
  h: 4
});
assert.deepEqual(pickGeometry(findItem(narrowResult.data.items, "child-b")), {
  x: 2,
  y: 14,
  w: 24,
  h: 3
});
assert.deepEqual(
  pickGeometry(findItem(narrowResult.data.items, "internal-child")),
  pickGeometry(relationItems[3])
);

const mobileResult = applyLayoutRelationProjectionCommand({
  items: relationItems,
  metrics: mobileMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(mobileResult.status, ADAPTER_STATUS.OK);
assert.equal(mobileResult.data.changed, true);
assert.deepEqual(pickGeometry(findItem(mobileResult.data.items, "child-a")), {
  x: 2,
  y: 9,
  w: 18,
  h: 4
});

const noRelationsItems = [
  { id: "content", x: 3, y: 3, w: 10, h: 6 },
  { id: "sidebar", x: 20, y: 3, w: 8, h: 10 }
];
const noRelationsBefore = structuredClone(noRelationsItems);

const noRelationsResult = applyLayoutRelationProjectionCommand({
  items: noRelationsItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(noRelationsResult.status, ADAPTER_STATUS.OK);
assert.equal(noRelationsResult.data.changed, false);
assert.equal(noRelationsResult.data.items, noRelationsItems);
assert.deepEqual(noRelationsItems, noRelationsBefore);

const overflowItems = [
  {
    id: "parent",
    x: 1,
    y: 1,
    w: 10,
    h: 6,
    meta: {
      layoutRelations: {
        children: [{ id: "child-a" }, { id: "child-b" }]
      }
    }
  },
  { id: "child-a", x: 20, y: 1, w: 8, h: 4 },
  { id: "child-b", x: 20, y: 10, w: 8, h: 4 }
];
const overflowBefore = structuredClone(overflowItems);

const invalidResult = applyLayoutRelationProjectionCommand({
  items: overflowItems,
  metrics: createMetrics(22, 10, { horizontalMode: "min-limit" }),
  sourceMetrics: desktopMetrics
});

assertAdapterShape(invalidResult);
assert.equal(invalidResult.status, ADAPTER_STATUS.ERROR);
assert.equal(invalidResult.ok, false);
assert.equal(invalidResult.data.changed, false);
assert.equal(invalidResult.data.items, overflowItems);
assert.equal(invalidResult.engineResult.valid, false);
assert.deepEqual(overflowItems, overflowBefore);
assert.deepEqual(relationItems, relationItemsBefore);

console.log("layout relation projection command tests passed");

function assertAdapterShape(result) {
  assert.equal(typeof result.ok, "boolean");
  assert.equal(typeof result.status, "string");
  assert.equal(typeof result.message, "string");
  assert.ok(result.data && typeof result.data === "object");
  assert.ok(Array.isArray(result.data.items));
  assert.equal(typeof result.data.changed, "boolean");
}

function createMetrics(columns, rows, debug = {}) {
  return {
    columns,
    rows,
    cellSize: 20,
    gridWidth: columns * 20,
    gridHeight: rows * 20,
    debug
  };
}

function pickGeometry(item) {
  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}

function findItem(items, id) {
  return items.find((item) => item.id === id);
}
