import { SIDEBAR_DOCKS, resolveSidebarDock } from "../contracts/sidebarDock.js";
import { SIDEBAR_STATES, resolveSidebarState } from "../contracts/sidebarState.js";
import {
  areSidebarElementContractsEqual,
  normalizeSidebarElementContract
} from "../contracts/sidebarElementContract.js";
import { resolveSidebarDockFromArea } from "../dock/resolveSidebarDock.js";

const SIDEBAR_BLOCK_TYPE = "sidebar";

export function createSidebarElementFromAreaCommand({
  item,
  metrics,
  defaultState = SIDEBAR_STATES.OVERLAY,
  defaultDock = SIDEBAR_DOCKS.LEFT,
  syncDockFromArea = false
} = {}) {
  if (!item || typeof item !== "object") {
    return createResult({
      valid: false,
      changed: false,
      item,
      reason: "invalid-item"
    });
  }

  if (!isSidebarItem(item)) {
    return createResult({
      valid: false,
      changed: false,
      item,
      reason: "item-is-not-sidebar"
    });
  }

  const dockFromArea = resolveSidebarDockFromArea({
    area: item,
    metrics,
    fallbackDock: defaultDock
  });
  const dock = resolveSidebarDock(
    syncDockFromArea ? dockFromArea : item?.meta?.sidebar?.dock ?? dockFromArea,
    defaultDock
  );
  const state = resolveSidebarState(item?.meta?.sidebar?.state, defaultState);
  const previousSidebar = isRecord(item?.meta?.sidebar) ? item.meta.sidebar : {};
  const nextSidebar = normalizeSidebarElementContract({
    item,
    sidebar: previousSidebar,
    dock,
    state,
    defaultState,
    defaultDock,
    createdFromArea: true,
    syncExpandedArea: true
  });
  const nextItem = {
    ...item,
    ...nextSidebar.expandedArea,
    meta: {
      ...(isRecord(item.meta) ? item.meta : {}),
      blockType: SIDEBAR_BLOCK_TYPE,
      sidebar: nextSidebar
    }
  };

  return createResult({
    valid: true,
    changed: !areSidebarElementContractsEqual(previousSidebar, nextSidebar),
    item: nextItem,
    reason: null
  });
}

function createResult({ valid, changed, item, reason }) {
  return {
    valid,
    changed,
    item,
    sidebar: item?.meta?.sidebar ?? null,
    reason
  };
}

function isSidebarItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === SIDEBAR_BLOCK_TYPE ||
    isRecord(item?.meta?.sidebar)
  );
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
