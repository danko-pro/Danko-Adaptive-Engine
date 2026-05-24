import assert from "node:assert/strict";
import {
  applyLayoutRelationProjectionCommand,
  fitItemsToGridCommand,
  resolveSceneItemsUpdate,
  resolveStoredSceneSourceItems,
  resolveVisibleSceneItems,
  shouldCommitSceneSourceUpdate
} from "../../../engine-adapter/index.js";

const workspaceId = "layout-workspace";
const sourceMetrics = createMetrics(75, 30);
const narrowMetrics = createMetrics(25, 30);
const sourceItems = [
  { id: "content", x: 20, y: 20, w: 30, h: 8, meta: { blockType: "content" } },
  { id: "sidebar", x: 68, y: 1, w: 8, h: 20, meta: { blockType: "sidebar", sidebar: { state: "fixed" } } }
];
const itemsByWorkspaceId = {
  [workspaceId]: sourceItems
};
const narrowProjection = fitItemsToGridCommand({
  items: sourceItems,
  metrics: narrowMetrics,
  sourceMetrics
});

assert.equal(narrowProjection.valid, true);
assert.equal(narrowProjection.changed, true);

const projectedUpdate = resolveSceneItemsUpdate({
  nextItems: narrowProjection.items,
  currentItems: sourceItems,
  options: { projected: true }
});
const projectedVisibleItems = projectedUpdate.visibleItems;

assert.equal(shouldCommitSceneSourceUpdate({ projected: true }), false);
assert.equal(projectedUpdate.shouldCommitSource, false);
assert.deepEqual(projectedVisibleItems, narrowProjection.items);
assert.deepEqual(
  resolveStoredSceneSourceItems({
    itemsByWorkspaceId,
    activeWorkspaceId: workspaceId
  }),
  sourceItems
);

const restoredProjection = fitItemsToGridCommand({
  items: sourceItems,
  metrics: sourceMetrics,
  sourceMetrics
});

assert.equal(restoredProjection.valid, true);
assert.equal(restoredProjection.changed, false);
assert.deepEqual(restoredProjection.items, sourceItems);

const userCommittedItems = [
  { ...sourceItems[0], x: 24 },
  sourceItems[1]
];

assert.equal(shouldCommitSceneSourceUpdate(), true);
assert.deepEqual(
  resolveVisibleSceneItems(userCommittedItems, projectedVisibleItems),
  userCommittedItems
);

const relationDesktopMetrics = createMetrics(64, 32);
const relationNarrowMetrics = createMetrics(40, 32, { horizontalMode: "compact" });
const relationSourceItems = [
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
const relationItemsByWorkspaceId = {
  [workspaceId]: relationSourceItems
};
const relationItemsBefore = structuredClone(relationSourceItems);

const relationNarrowProjection = applyLayoutRelationProjectionCommand({
  items: relationSourceItems,
  metrics: relationNarrowMetrics,
  sourceMetrics: relationDesktopMetrics
});

assert.equal(relationNarrowProjection.ok, true);
assert.equal(relationNarrowProjection.data.changed, true);

const relationProjectedUpdate = resolveSceneItemsUpdate({
  nextItems: relationNarrowProjection.data.items,
  currentItems: relationSourceItems,
  options: { projected: true }
});

assert.equal(relationProjectedUpdate.shouldCommitSource, false);
assert.notDeepEqual(
  pickGeometry(findItem(relationProjectedUpdate.visibleItems, "child-a")),
  pickGeometry(findItem(relationSourceItems, "child-a"))
);
assert.deepEqual(pickGeometry(findItem(relationProjectedUpdate.visibleItems, "child-a")), {
  x: 2,
  y: 9,
  w: 18,
  h: 4
});
assert.deepEqual(
  resolveStoredSceneSourceItems({
    itemsByWorkspaceId: relationItemsByWorkspaceId,
    activeWorkspaceId: workspaceId
  }),
  relationSourceItems
);

const relationDesktopRestore = applyLayoutRelationProjectionCommand({
  items: relationSourceItems,
  metrics: relationDesktopMetrics,
  sourceMetrics: relationDesktopMetrics
});

assert.equal(relationDesktopRestore.ok, true);
assert.equal(relationDesktopRestore.data.changed, false);
assert.equal(relationDesktopRestore.data.items, relationSourceItems);
assert.deepEqual(
  pickGeometry(findItem(relationDesktopRestore.data.items, "child-a")),
  pickGeometry(findItem(relationSourceItems, "child-a"))
);
assert.deepEqual(relationSourceItems, relationItemsBefore);

console.log("operation probe source-state tests passed");

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
