import assert from "node:assert/strict";
import {
  SCENE_ITEM_UPDATE_ORIGINS,
  resolveSceneItemsUpdate,
  resolveStoredSceneSourceItems,
  resolveVisibleSceneItems,
  shouldCommitSceneSourceUpdate
} from "../index.js";

const sourceItems = [
  { id: "content", x: 10, y: 6, w: 8, h: 6 }
];
const projectedItems = [
  { id: "content", x: 4, y: 6, w: 8, h: 6 }
];
const workspaceId = "layout-workspace";

const projectionUpdate = resolveSceneItemsUpdate({
  nextItems: projectedItems,
  currentItems: sourceItems,
  options: { origin: SCENE_ITEM_UPDATE_ORIGINS.PROJECTION }
});

assert.deepEqual(projectionUpdate.visibleItems, projectedItems);
assert.equal(projectionUpdate.origin, SCENE_ITEM_UPDATE_ORIGINS.PROJECTION);
assert.equal(projectionUpdate.shouldCommitSource, false);
assert.equal(shouldCommitSceneSourceUpdate({ projected: true }), false);
assert.equal(
  resolveSceneItemsUpdate({
    nextItems: projectedItems,
    currentItems: sourceItems,
    options: {
      origin: SCENE_ITEM_UPDATE_ORIGINS.SOURCE,
      projected: true
    }
  }).shouldCommitSource,
  false
);
assert.equal(
  resolveSceneItemsUpdate({
    nextItems: projectedItems,
    currentItems: sourceItems,
    options: {
      origin: "broken-origin"
    }
  }).shouldCommitSource,
  true
);

const sourceUpdate = resolveSceneItemsUpdate({
  nextItems: (currentItems) => currentItems.map((item) => ({ ...item, x: item.x + 1 })),
  currentItems: projectedItems
});

assert.deepEqual(sourceUpdate.visibleItems, [
  { id: "content", x: 5, y: 6, w: 8, h: 6 }
]);
assert.equal(sourceUpdate.origin, SCENE_ITEM_UPDATE_ORIGINS.SOURCE);
assert.equal(sourceUpdate.shouldCommitSource, true);
assert.equal(shouldCommitSceneSourceUpdate(), true);

assert.deepEqual(resolveVisibleSceneItems(null, sourceItems), sourceItems);
assert.deepEqual(
  resolveStoredSceneSourceItems({
    itemsByWorkspaceId: {
      [workspaceId]: sourceItems
    },
    activeWorkspaceId: workspaceId,
    fallbackItems: projectedItems
  }),
  sourceItems
);
assert.deepEqual(
  resolveStoredSceneSourceItems({
    itemsByWorkspaceId: {},
    activeWorkspaceId: workspaceId,
    fallbackItems: projectedItems
  }),
  projectedItems
);

console.log("adapter scene source/projection state tests passed");
