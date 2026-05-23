import {
  createProjectSceneState,
  resolveProjectSceneWithShellItemPolicy
} from "../../../engine-adapter/index.js";
import {
  SIDEBAR_DOCKS,
  SIDEBAR_STATES,
  createSidebarElementFromAreaCommand
} from "../../../sidebar-element/index.js";
import {
  getInitialNavigationProbePageId,
  getWorkspaceIdByPageId,
  initialNavigationProbeItemsByWorkspace
} from "./navigationProbeData.js";

export function createInitialNavigationProbeProjectScene() {
  const activePageId = getInitialNavigationProbePageId();
  const activeWorkspaceId = getWorkspaceIdByPageId(activePageId);

  return resolveNavigationProbeProjectScene(createProjectSceneState({
    activePageId,
    activeWorkspaceId,
    shellItems: [],
    workspaceItemsById: initialNavigationProbeItemsByWorkspace
  }));
}

export function resolveNavigationProbeProjectScene(projectScene) {
  const scene = normalizeNavigationProbeShellSidebarDefaults(projectScene);

  return resolveProjectSceneWithShellItemPolicy({
    projectScene: scene,
    isShellItem: isNavigationProbeShellItem
  });
}

export function isNavigationProbeShellItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === "sidebar" ||
    Boolean(item?.meta?.sidebar && typeof item.meta.sidebar === "object")
  );
}

function normalizeNavigationProbeShellSidebarDefaults(projectScene) {
  const scene = createProjectSceneState(projectScene);

  return createProjectSceneState({
    ...scene,
    shellItems: scene.shellItems.map(resolveNavigationProbeShellSidebarDefaults),
    workspaceItemsById: Object.fromEntries(
      Object.entries(scene.workspaceItemsById).map(([workspaceId, items]) => [
        workspaceId,
        items.map(resolveNavigationProbeShellSidebarDefaults)
      ])
    )
  });
}

function resolveNavigationProbeShellSidebarDefaults(item) {
  if (!isNavigationProbeShellItem(item) || item?.meta?.sidebar?.state) {
    return item;
  }

  const command = createSidebarElementFromAreaCommand({
    item,
    defaultState: SIDEBAR_STATES.FIXED,
    defaultDock: SIDEBAR_DOCKS.RIGHT
  });

  return command.valid ? command.item : item;
}
