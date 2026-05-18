import { SIDEBAR_LAYERS } from "./sidebarLayer.js";
import { SIDEBAR_STATES, resolveSidebarState } from "./sidebarState.js";

export const SIDEBAR_RENDER_MODES = {
  VISIBLE: "visible",
  COLLAPSED: "collapsed",
  HIDDEN: "hidden"
};

export const SIDEBAR_STATE_POLICIES = {
  [SIDEBAR_STATES.FIXED]: {
    state: SIDEBAR_STATES.FIXED,
    layer: SIDEBAR_LAYERS.LAYOUT,
    renderMode: SIDEBAR_RENDER_MODES.VISIBLE,
    reservesSpace: true,
    affectsWorkspaceBlocks: true,
    allowsWorkspaceBlocksUnder: false,
    preservesDeclaredArea: true,
    reflowOnEnter: true
  },
  [SIDEBAR_STATES.OVERLAY]: {
    state: SIDEBAR_STATES.OVERLAY,
    layer: SIDEBAR_LAYERS.OVERLAY,
    renderMode: SIDEBAR_RENDER_MODES.VISIBLE,
    reservesSpace: false,
    affectsWorkspaceBlocks: false,
    allowsWorkspaceBlocksUnder: true,
    preservesDeclaredArea: true,
    reflowOnEnter: false
  },
  [SIDEBAR_STATES.COLLAPSED]: {
    state: SIDEBAR_STATES.COLLAPSED,
    layer: SIDEBAR_LAYERS.OVERLAY,
    renderMode: SIDEBAR_RENDER_MODES.COLLAPSED,
    reservesSpace: false,
    affectsWorkspaceBlocks: false,
    allowsWorkspaceBlocksUnder: true,
    preservesDeclaredArea: false,
    reflowOnEnter: false
  },
  [SIDEBAR_STATES.HIDDEN]: {
    state: SIDEBAR_STATES.HIDDEN,
    layer: SIDEBAR_LAYERS.OVERLAY,
    renderMode: SIDEBAR_RENDER_MODES.HIDDEN,
    reservesSpace: false,
    affectsWorkspaceBlocks: false,
    allowsWorkspaceBlocksUnder: true,
    preservesDeclaredArea: false,
    reflowOnEnter: false
  }
};

export function resolveSidebarStatePolicy(value, fallback = SIDEBAR_STATES.OVERLAY) {
  const state = resolveSidebarState(readSidebarState(value), fallback);
  return SIDEBAR_STATE_POLICIES[state] ?? SIDEBAR_STATE_POLICIES[SIDEBAR_STATES.OVERLAY];
}

export function sidebarStateReservesSpace(value) {
  return resolveSidebarStatePolicy(value).reservesSpace;
}

export function sidebarStateAffectsWorkspaceBlocks(value) {
  return resolveSidebarStatePolicy(value).affectsWorkspaceBlocks;
}

export function sidebarStateAllowsWorkspaceBlocksUnder(value) {
  return resolveSidebarStatePolicy(value).allowsWorkspaceBlocksUnder;
}

function readSidebarState(value) {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  if (typeof value.state === "string") {
    return value.state;
  }

  return value.meta?.sidebar?.state ?? null;
}
