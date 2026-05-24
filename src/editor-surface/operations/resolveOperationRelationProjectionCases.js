import assert from "node:assert/strict";
import { ADAPTER_STATUS } from "../../../engine-adapter/index.js";
import { hasLayoutRelationItems } from "./hasLayoutRelations.js";
import { resolveOperationRelationProjection } from "./resolveOperationRelationProjection.js";

const desktopMetrics = createMetrics(64, 32);
const narrowMetrics = createMetrics(40, 32, { horizontalMode: "compact" });

const relationItems = [
  {
    id: "parent",
    x: 2,
    y: 2,
    w: 18,
    h: 6,
    meta: {
      layoutRelations: {
        children: [{ id: "child-a", order: 1 }]
      }
    }
  },
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 },
  { id: "solo", x: 1, y: 26, w: 8, h: 4 }
];
const relationItemsBefore = structuredClone(relationItems);

assert.equal(hasLayoutRelationItems(relationItems), true);
assert.equal(hasLayoutRelationItems([{ id: "solo", meta: { dependencies: ["other"] } }]), false);

const desktopBridge = resolveOperationRelationProjection({
  items: relationItems,
  metrics: desktopMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(desktopBridge.shouldProject, false);
assert.equal(desktopBridge.items, relationItems);
assert.equal(desktopBridge.command.status, ADAPTER_STATUS.OK);
assert.equal(desktopBridge.command.data.changed, false);

const narrowBridge = resolveOperationRelationProjection({
  items: relationItems,
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(narrowBridge.shouldProject, true);
assert.notEqual(narrowBridge.items, relationItems);
assert.deepEqual(pickGeometry(findItem(narrowBridge.items, "child-a")), {
  x: 2,
  y: 9,
  w: 18,
  h: 4
});

const noRelationsBridge = resolveOperationRelationProjection({
  items: [{ id: "solo", x: 1, y: 1, w: 4, h: 4 }],
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(noRelationsBridge.shouldProject, false);
assert.equal(noRelationsBridge.command, null);

assert.deepEqual(relationItems, relationItemsBefore);

console.log("operation relation projection bridge tests passed");

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
