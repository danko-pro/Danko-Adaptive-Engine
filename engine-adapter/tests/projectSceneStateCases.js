import assert from "node:assert/strict";
import {
  PROJECT_SCENE_OPERATION_SCOPES,
  PROJECT_SCENE_STORAGE_VERSION,
  createProjectSceneState,
  createProjectSceneStorageSnapshot,
  resolveActiveWorkspaceItems,
  resolveProjectSceneItemConflicts,
  resolveProjectSceneOperationScope,
  resolveProjectSceneStorageSnapshot,
  resolveProjectSceneWithActiveWorkspaceItems,
  resolveProjectSceneWithShellItemPolicy,
  resolveProjectSceneWithVisibleItems,
  resolveShellItemsFromVisibleProjectSceneItems,
  resolveVisibleProjectSceneItems
} from "../index.js";

const sidebar = createItem("main-sidebar", { blockType: "sidebar" });
const layoutContent = createItem("layout-content", { blockType: "content" });
const contentBlock = createItem("content-block", { blockType: "content" });
const fallbackBlock = createItem("fallback-block", { blockType: "content" });
const projectScene = createProjectSceneState({
  activePageId: "layout-page",
  activeWorkspaceId: "layout-workspace",
  shellItems: [sidebar],
  workspaceItemsById: {
    "layout-workspace": [layoutContent],
    "content-workspace": [contentBlock]
  }
});

assert.equal(projectScene.activePageId, "layout-page");
assert.equal(projectScene.activeWorkspaceId, "layout-workspace");
assert.deepEqual(resolveActiveWorkspaceItems({ projectScene }), [layoutContent]);
assert.deepEqual(resolveVisibleProjectSceneItems({ projectScene }), [sidebar, layoutContent]);
assert.deepEqual(
  resolveProjectSceneWithVisibleItems({
    projectScene,
    visibleItems: [
      { ...sidebar, x: 2 },
      { ...layoutContent, x: 3 }
    ]
  }).shellItems,
  [{ ...sidebar, x: 2 }]
);
assert.deepEqual(
  resolveProjectSceneWithVisibleItems({
    projectScene,
    visibleItems: [
      { ...sidebar, x: 2 },
      { ...layoutContent, x: 3 }
    ]
  }).workspaceItemsById["layout-workspace"],
  [{ ...layoutContent, x: 3 }]
);
assert.deepEqual(
  resolveShellItemsFromVisibleProjectSceneItems({
    projectScene,
    visibleItems: [
      { ...sidebar, y: 2 },
      { ...layoutContent, x: 3 }
    ]
  }),
  [{ ...sidebar, y: 2 }]
);
assert.deepEqual(
  resolveProjectSceneWithActiveWorkspaceItems({
    projectScene,
    workspaceItems: [{ ...layoutContent, y: 4 }]
  }).workspaceItemsById["layout-workspace"],
  [{ ...layoutContent, y: 4 }]
);

assert.deepEqual(
  createProjectSceneState({
    activeWorkspaceId: "missing-workspace",
    fallbackWorkspaceItems: [fallbackBlock]
  }).workspaceItemsById,
  {
    "missing-workspace": [fallbackBlock]
  }
);

const workspaceSidebar = createItem("workspace-sidebar", { blockType: "sidebar" });
const workspaceSidebarScene = createProjectSceneState({
  activeWorkspaceId: "layout-workspace",
  shellItems: [],
  workspaceItemsById: {
    "layout-workspace": [layoutContent],
    "content-workspace": [workspaceSidebar, contentBlock]
  }
});
const migratedShellScene = resolveProjectSceneWithShellItemPolicy({
  projectScene: workspaceSidebarScene,
  isShellItem: isSidebarItem
});

assert.deepEqual(migratedShellScene.shellItems, [workspaceSidebar]);
assert.deepEqual(migratedShellScene.workspaceItemsById["content-workspace"], [contentBlock]);
assert.deepEqual(
  resolveProjectSceneWithVisibleItems({
    projectScene: workspaceSidebarScene,
    visibleItems: [
      layoutContent,
      workspaceSidebar
    ],
    isShellItem: isSidebarItem
  }),
  createProjectSceneState({
    activeWorkspaceId: "layout-workspace",
    shellItems: [workspaceSidebar],
    workspaceItemsById: {
      "layout-workspace": [layoutContent],
      "content-workspace": [workspaceSidebar, contentBlock]
    }
  })
);

assert.deepEqual(
  resolveProjectSceneOperationScope({
    projectScene,
    targetId: sidebar.id
  }),
  {
    scope: PROJECT_SCENE_OPERATION_SCOPES.SHELL,
    reason: "target-in-shell",
    targetId: sidebar.id
  }
);

assert.deepEqual(
  resolveProjectSceneOperationScope({
    projectScene,
    operation: {
      targetId: layoutContent.id
    }
  }),
  {
    scope: PROJECT_SCENE_OPERATION_SCOPES.WORKSPACE,
    reason: "target-in-active-workspace",
    targetId: layoutContent.id
  }
);

assert.deepEqual(
  resolveProjectSceneOperationScope({
    projectScene,
    operation: {
      meta: {
        sceneScope: PROJECT_SCENE_OPERATION_SCOPES.SHELL
      }
    }
  }),
  {
    scope: PROJECT_SCENE_OPERATION_SCOPES.SHELL,
    reason: "explicit-scope",
    targetId: null
  }
);

assert.deepEqual(
  resolveProjectSceneOperationScope({
    projectScene,
    targetId: "new-content"
  }),
  {
    scope: PROJECT_SCENE_OPERATION_SCOPES.WORKSPACE,
    reason: "fallback-scope",
    targetId: "new-content"
  }
);

const conflictScene = createProjectSceneState({
  activeWorkspaceId: "layout-workspace",
  shellItems: [sidebar],
  workspaceItemsById: {
    "layout-workspace": [{ ...layoutContent, id: sidebar.id }]
  }
});
const conflicts = resolveProjectSceneItemConflicts({ projectScene: conflictScene });

assert.equal(conflicts.length, 1);
assert.equal(conflicts[0].id, sidebar.id);
assert.deepEqual(
  conflicts[0].occurrences.map((occurrence) => occurrence.scope),
  [
    PROJECT_SCENE_OPERATION_SCOPES.SHELL,
    PROJECT_SCENE_OPERATION_SCOPES.WORKSPACE
  ]
);
assert.equal(
  resolveProjectSceneOperationScope({
    projectScene: conflictScene,
    targetId: sidebar.id
  }).reason,
  "ambiguous-target"
);

const snapshot = createProjectSceneStorageSnapshot({ projectScene });

assert.deepEqual(snapshot, {
  version: PROJECT_SCENE_STORAGE_VERSION,
  activePageId: "layout-page",
  activeWorkspaceId: "layout-workspace",
  shellItems: [sidebar],
  workspaceItemsById: {
    "layout-workspace": [layoutContent],
    "content-workspace": [contentBlock]
  }
});

assert.deepEqual(
  resolveProjectSceneStorageSnapshot([layoutContent], {
    activeWorkspaceId: "legacy-workspace"
  }),
  {
    version: PROJECT_SCENE_STORAGE_VERSION,
    activePageId: null,
    activeWorkspaceId: "legacy-workspace",
    shellItems: [],
    workspaceItemsById: {
      "legacy-workspace": [layoutContent]
    }
  }
);

assert.deepEqual(
  resolveProjectSceneStorageSnapshot(null, {
    fallbackState: projectScene
  }),
  snapshot
);

console.log("adapter project-scene state tests passed");

function createItem(id, meta = {}) {
  return {
    id,
    x: 1,
    y: 1,
    w: 2,
    h: 2,
    meta
  };
}

function isSidebarItem(item) {
  return String(item?.meta?.blockType ?? "").trim() === "sidebar";
}
