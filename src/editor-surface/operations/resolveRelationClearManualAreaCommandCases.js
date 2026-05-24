import assert from "node:assert/strict";
import { applyLayoutRelationManualAreaCommand } from "../../../engine-adapter/index.js";
import { resolveRelationClearManualAreaCommand } from "./resolveRelationClearManualAreaCommand.js";

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
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 }
];
const relationItemsBefore = structuredClone(relationItems);

const patchedItems = applyLayoutRelationManualAreaCommand({
  items: relationItems,
  parentId: "parent",
  childId: "child-a",
  viewportMode: "narrow",
  area: { x: 5, y: 9, w: 10, h: 2 }
}).data.items;

const clearBridge = resolveRelationClearManualAreaCommand({
  items: patchedItems,
  parentId: "parent",
  childId: "child-a",
  viewportMode: "narrow",
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(clearBridge.command.valid, true);
assert.equal(clearBridge.command.changed, true);
assert.equal(clearBridge.command.parentId, "parent");
assert.equal(clearBridge.command.childId, "child-a");
assert.equal(clearBridge.command.viewportMode, "narrow");
assert.equal(
  clearBridge.command.items.find((item) => item.id === "parent").meta.layoutRelations.children[0]
    .manualAreas.narrow,
  null
);
assert.equal(clearBridge.projection?.ok, true);
assert.deepEqual(pickGeometry(findItem(clearBridge.projection.data.items, "child-a")), {
  x: 2,
  y: 9,
  w: 18,
  h: 4
});

const invalidViewportBridge = resolveRelationClearManualAreaCommand({
  items: patchedItems,
  parentId: "parent",
  childId: "child-a",
  viewportMode: "default",
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics
});

assert.equal(invalidViewportBridge.command.valid, false);
assert.equal(invalidViewportBridge.projection, null);
assert.equal(invalidViewportBridge.command.items, patchedItems);

assert.deepEqual(relationItems, relationItemsBefore);

console.log("relation clear manual area bridge tests passed");

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
