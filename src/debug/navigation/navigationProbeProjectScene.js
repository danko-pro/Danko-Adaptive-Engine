import {
  createProjectSceneState,
  resolveProjectSceneWithShellItemPolicy
} from "../../../engine-adapter/index.js";
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
  return resolveProjectSceneWithShellItemPolicy({
    projectScene,
    isShellItem: isNavigationProbeShellItem
  });
}

export function isNavigationProbeShellItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === "sidebar" ||
    Boolean(item?.meta?.sidebar && typeof item.meta.sidebar === "object")
  );
}
