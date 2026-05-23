import assert from "node:assert/strict";
import { resolveVisibleProjectSceneItems } from "../../../engine-adapter/index.js";
import {
  SIDEBAR_DOCKS,
  SIDEBAR_STATES,
  resolveOperationRenderLayers
} from "../../../sidebar-element/index.js";
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
assert.equal(projectScene.shellItems[0].meta.sidebar.state, SIDEBAR_STATES.FIXED);
assert.equal(projectScene.shellItems[0].meta.sidebar.dock, SIDEBAR_DOCKS.RIGHT);
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
assert.equal(restoredScene.shellItems[0].meta.sidebar.state, SIDEBAR_STATES.FIXED);
assert.equal(restoredScene.shellItems[0].meta.sidebar.dock, SIDEBAR_DOCKS.RIGHT);
assert.deepEqual(
  restoredScene.workspaceItemsById["content-workspace"].map((item) => item.id),
  ["content-a"]
);

const mobileLayers = resolveOperationRenderLayers(projectScene.shellItems, {
  metrics: createMobileMetrics()
});
const mobileSidebarRenderInfo = mobileLayers.itemRenderInfoById.get("sidebar-a");

assert.equal(mobileSidebarRenderInfo.mobilePresentation.mode, "compact-menu-button");
assert.deepEqual(mobileSidebarRenderInfo.renderArea, { x: 1, y: 1, w: 12, h: 2 });
assert.deepEqual(mobileSidebarRenderInfo.mobilePresentation.buttonArea, { x: 11, y: 1, w: 2, h: 2 });

console.log("debug navigation project-scene tests passed");

function createMobileMetrics() {
  return {
    columns: 12,
    rows: 16,
    cellSize: 20,
    gridWidth: 240,
    gridHeight: 320,
    debug: {
      mode: "minimum",
      horizontalMode: "min-limit",
      verticalMode: "normal"
    }
  };
}
