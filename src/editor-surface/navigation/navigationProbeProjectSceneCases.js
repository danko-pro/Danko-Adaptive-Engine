import assert from "node:assert/strict";
import { resolveVisibleProjectSceneItems } from "../../../engine-adapter/index.js";
import { initialOperationProbeItems } from "../operations/operationProbeData.js";
import {
  createInitialNavigationProbeProjectScene,
  isNavigationProbeShellItem,
  resolveNavigationProbeProjectScene
} from "./navigationProbeProjectScene.js";

const projectScene = createInitialNavigationProbeProjectScene();

assert.deepEqual(
  projectScene.shellItems.map((item) => item.id),
  ["sidebar-a"]
);
assert.equal(projectScene.workspaceItemsById["content-workspace"].some(isNavigationProbeShellItem), false);
assert.deepEqual(
  resolveVisibleProjectSceneItems({ projectScene }).map((item) => item.id),
  ["sidebar-a", ...initialOperationProbeItems.map((item) => item.id)]
);

const restoredScene = resolveNavigationProbeProjectScene({
  activePageId: "content-page",
  activeWorkspaceId: "content-workspace",
  shellItems: [],
  workspaceItemsById: {
    "content-workspace": [
      { id: "content-a", x: 1, y: 1, w: 2, h: 2, meta: { blockType: "content" } },
      { id: "restored-sidebar", x: 1, y: 1, w: 3, h: 10, meta: { blockType: "sidebar" } }
    ]
  }
});

assert.deepEqual(
  restoredScene.shellItems.map((item) => item.id),
  ["restored-sidebar"]
);
assert.deepEqual(
  restoredScene.workspaceItemsById["content-workspace"].map((item) => item.id),
  ["content-a"]
);

console.log("debug navigation project-scene tests passed");
