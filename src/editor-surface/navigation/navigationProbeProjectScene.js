import {
  createProjectSceneState,
  resolveProjectSceneWithShellItemPolicy
} from "../../../engine-adapter/index.js";
import {
  SIDEBAR_DOCKS,
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_STATES,
  createSidebarElementFromAreaCommand,
  isSidebarDock,
  resolveSidebarMobileRenderStrategy
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
  if (!isNavigationProbeShellItem(item)) {
    return item;
  }

  const previousSidebar = item?.meta?.sidebar ?? {};
  const mobileRenderStrategy = resolveSidebarMobileRenderStrategy(
    previousSidebar.mobileRenderStrategy,
    SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
  );
  const dock = resolveNavigationProbeShellSidebarDock(item, previousSidebar);

  const command = createSidebarElementFromAreaCommand({
    item: {
      ...item,
      meta: {
        ...(item?.meta ?? {}),
        sidebar: {
          ...previousSidebar,
          state: SIDEBAR_STATES.FIXED,
          dock,
          mobileRenderStrategy
        }
      }
    },
    defaultState: SIDEBAR_STATES.FIXED,
    defaultDock: dock
  });

  return command.valid ? command.item : item;
}

function resolveNavigationProbeShellSidebarDock(item, previousSidebar) {
  if (isSidebarDock(previousSidebar?.dock)) {
    return previousSidebar.dock;
  }

  const x = Number(item?.x);
  const y = Number(item?.y);
  const w = Number(item?.w);
  const h = Number(item?.h);

  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) {
    return SIDEBAR_DOCKS.LEFT;
  }

  if (h > w) {
    return x <= 1 ? SIDEBAR_DOCKS.LEFT : SIDEBAR_DOCKS.RIGHT;
  }

  return y <= 1 ? SIDEBAR_DOCKS.TOP : SIDEBAR_DOCKS.BOTTOM;
}
