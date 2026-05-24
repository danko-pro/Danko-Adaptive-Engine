import assert from "node:assert/strict";
import {
  applyLayoutRelationProjectionCommand,
  LAYOUT_RELATION_CHILD_KINDS,
  LAYOUT_RELATION_VIEWPORT_MODES
} from "../../../engine-adapter/index.js";
import { resolveRelationManualMoveCommand } from "./resolveRelationManualMoveCommand.js";

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
        children: [{ id: "child-a", order: 1 }]
      }
    }
  },
  { id: "child-a", x: 30, y: 12, w: 18, h: 4 },
  {
    id: "parent-internal",
    x: 1,
    y: 20,
    w: 8,
    h: 4,
    meta: {
      layoutRelations: {
        children: [
          {
            id: "internal-child",
            kind: LAYOUT_RELATION_CHILD_KINDS.INTERNAL_CONTENT_ITEM
          }
        ]
      }
    }
  },
  { id: "internal-child", x: 20, y: 1, w: 2, h: 2 },
  { id: "solo", x: 1, y: 26, w: 8, h: 4 }
];
const relationItemsBefore = structuredClone(relationItems);

assert.equal(
  resolveRelationManualMoveCommand({
    items: relationItems,
    item: relationItems[1],
    metrics: desktopMetrics,
    nextArea: { x: 31, y: 13, w: 18, h: 4 }
  }),
  null
);

const narrowMove = resolveRelationManualMoveCommand({
  items: relationItems,
  item: relationItems[1],
  metrics: narrowMetrics,
  sourceMetrics: desktopMetrics,
  nextArea: { x: 5, y: 11, w: 18, h: 4 }
});

assert.equal(narrowMove.command.valid, true);
assert.deepEqual(
  narrowMove.command.items.find((item) => item.id === "parent").meta.layoutRelations.children[0]
    .manualAreas.narrow,
  { x: 5, y: 11, w: 18, h: 4 }
);
assert.deepEqual(pickGeometry(findItem(narrowMove.command.items, "parent")), {
  x: 2,
  y: 2,
  w: 18,
  h: 6
});
assert.deepEqual(pickGeometry(findItem(narrowMove.command.items, "child-a")), {
  x: 30,
  y: 12,
  w: 18,
  h: 4
});
assert.equal(narrowMove.projection?.ok, true);
assert.deepEqual(pickGeometry(findItem(narrowMove.projection.data.items, "child-a")), {
  x: 5,
  y: 11,
  w: 18,
  h: 4
});

const mobileMove = resolveRelationManualMoveCommand({
  items: relationItems,
  item: relationItems[1],
  metrics: mobileMetrics,
  sourceMetrics: desktopMetrics,
  nextArea: { x: 3, y: 10, w: 18, h: 4 }
});

assert.equal(mobileMove.command.valid, true);
assert.deepEqual(
  mobileMove.command.items.find((item) => item.id === "parent").meta.layoutRelations.children[0]
    .manualAreas.mobile,
  { x: 3, y: 10, w: 18, h: 4 }
);

const projectedAfterMobile = applyLayoutRelationProjectionCommand({
  items: mobileMove.command.items,
  metrics: mobileMetrics,
  sourceMetrics: desktopMetrics
});

assert.deepEqual(pickGeometry(findItem(projectedAfterMobile.data.items, "child-a")), {
  x: 3,
  y: 10,
  w: 18,
  h: 4
});

assert.equal(
  resolveRelationManualMoveCommand({
    items: relationItems,
    item: relationItems[4],
    metrics: narrowMetrics,
    nextArea: { x: 2, y: 27, w: 8, h: 4 }
  }),
  null
);

assert.equal(
  resolveRelationManualMoveCommand({
    items: relationItems,
    item: relationItems[3],
    metrics: mobileMetrics,
    nextArea: { x: 4, y: 2, w: 2, h: 2 }
  }),
  null
);

const invalidMove = resolveRelationManualMoveCommand({
  items: relationItems,
  item: relationItems[1],
  metrics: narrowMetrics,
  nextArea: { x: 0, y: 11, w: 18, h: 4 }
});

assert.equal(invalidMove.command.valid, false);
assert.equal(invalidMove.projection, null);
assert.equal(invalidMove.command.items, relationItems);

assert.deepEqual(relationItems, relationItemsBefore);

console.log("relation manual move bridge tests passed");

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
