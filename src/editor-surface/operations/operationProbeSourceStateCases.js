import assert from "node:assert/strict";
import {
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

console.log("operation probe source-state tests passed");

function createMetrics(columns, rows) {
  return {
    columns,
    rows,
    cellSize: 20,
    gridWidth: columns * 20,
    gridHeight: rows * 20
  };
}
