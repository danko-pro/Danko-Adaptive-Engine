import { COMPOSITION_BLOCK_ROLES } from "../contracts/compositionBlockRoles.js";

export const COMPOSITION_BEHAVIOR_PROFILE_IDS = {
  HEADER: "header",
  SIDEBAR: "sidebar",
  CONTENT: "content",
  CONTROL: "control",
  WARNING: "warning",
  FULL_WIDTH: "full-width",
  FULL_HEIGHT: "full-height",
  EDGE_BOUND: "edge-bound",
  CENTER_CONTENT: "center-content",
  UTILITY: "utility",
  UNKNOWN: "unknown"
};

export const COMPOSITION_BEHAVIOR_ANCHORS = {
  TOP_WIDTH: "top-width",
  LEFT_SIDE: "left-side",
  RIGHT_SIDE: "right-side",
  HEADER_DOCK: "header-dock",
  BOTTOM_BAND: "bottom-band",
  CENTER: "center",
  CURRENT_EDGE: "current-edge",
  CURRENT_POSITION: "current-position",
  FLOW: "flow"
};

export const COMPOSITION_BEHAVIOR_LAYERS = {
  LAYOUT: "layout",
  OVERLAY: "overlay"
};

export const COMPOSITION_SIDEBAR_MODES = {
  STATIC: "static",
  COLLAPSIBLE: "collapsible",
  OVERLAY: "overlay",
  TRIGGER: "trigger",
  DOCKABLE: "dockable"
};

export const COMPOSITION_SIDEBAR_DOCKS = {
  LEFT: "left",
  RIGHT: "right",
  TOP: "top",
  BOTTOM: "bottom",
  HEADER: "header"
};

const COMMON_V4_LIMITS = {
  internalGrid: "pending",
  minReadableTextPx: 14,
  requiresContentMeasure: true
};

const baseProfile = {
  id: COMPOSITION_BEHAVIOR_PROFILE_IDS.UNKNOWN,
  role: COMPOSITION_BLOCK_ROLES.UNKNOWN,
  priority: 10,
  minSize: { w: 1, h: 1 },
  preferredGap: 1,
  anchors: [COMPOSITION_BEHAVIOR_ANCHORS.CURRENT_POSITION],
  canMove: true,
  canResize: true,
  canShrink: true,
  canGrow: true,
  canWrap: true,
  canStack: true,
  canDetachFromGroup: true,
  layout: {
    layer: COMPOSITION_BEHAVIOR_LAYERS.LAYOUT,
    reservesSpace: true,
    affectsContentFlow: true,
    declaredAreaMeaning: "reserved-layout-area"
  },
  overflowStrategy: "ask-for-content-rules",
  fallbackOrder: ["preserve-current-position", "ask-for-manual-rule"],
  v4: {
    ...COMMON_V4_LIMITS,
    requiresContentMeasure: false
  }
};

export const COMPOSITION_BEHAVIOR_PROFILES = {
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.HEADER]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.HEADER,
    role: COMPOSITION_BLOCK_ROLES.FULL_WIDTH,
    priority: 100,
    minSize: { w: 12, h: 2 },
    anchors: [COMPOSITION_BEHAVIOR_ANCHORS.TOP_WIDTH],
    canMove: false,
    canShrink: true,
    canWrap: false,
    canStack: false,
    canDetachFromGroup: false,
    overflowStrategy: "keep-top-band",
    fallbackOrder: ["keep-full-width", "compact-height", "reject"],
    v4: {
      ...COMMON_V4_LIMITS,
      internalGrid: "horizontal-band"
    }
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.SIDEBAR]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.SIDEBAR,
    role: COMPOSITION_BLOCK_ROLES.EDGE_BOUND,
    priority: 80,
    minSize: { w: 4, h: 6 },
    anchors: [
      COMPOSITION_BEHAVIOR_ANCHORS.LEFT_SIDE,
      COMPOSITION_BEHAVIOR_ANCHORS.RIGHT_SIDE,
      COMPOSITION_BEHAVIOR_ANCHORS.TOP_WIDTH,
      COMPOSITION_BEHAVIOR_ANCHORS.BOTTOM_BAND,
      COMPOSITION_BEHAVIOR_ANCHORS.HEADER_DOCK
    ],
    sidebar: {
      defaultMode: COMPOSITION_SIDEBAR_MODES.STATIC,
      modes: [
        {
          id: COMPOSITION_SIDEBAR_MODES.STATIC,
          layer: COMPOSITION_BEHAVIOR_LAYERS.LAYOUT,
          reservesSpace: true,
          affectsContentFlow: true,
          declaredAreaMeaning: "reserved-layout-area"
        },
        {
          id: COMPOSITION_SIDEBAR_MODES.COLLAPSIBLE,
          layer: COMPOSITION_BEHAVIOR_LAYERS.LAYOUT,
          reservesSpace: true,
          affectsContentFlow: true,
          declaredAreaMeaning: "expanded-area-before-collapse"
        },
        {
          id: COMPOSITION_SIDEBAR_MODES.OVERLAY,
          layer: COMPOSITION_BEHAVIOR_LAYERS.OVERLAY,
          reservesSpace: false,
          affectsContentFlow: false,
          declaredAreaMeaning: "opened-overlay-area"
        },
        {
          id: COMPOSITION_SIDEBAR_MODES.TRIGGER,
          layer: COMPOSITION_BEHAVIOR_LAYERS.OVERLAY,
          reservesSpace: false,
          affectsContentFlow: false,
          declaredAreaMeaning: "trigger-area"
        },
        {
          id: COMPOSITION_SIDEBAR_MODES.DOCKABLE,
          layer: COMPOSITION_BEHAVIOR_LAYERS.LAYOUT,
          reservesSpace: true,
          affectsContentFlow: true,
          declaredAreaMeaning: "dock-target-area"
        }
      ],
      docks: [
        COMPOSITION_SIDEBAR_DOCKS.LEFT,
        COMPOSITION_SIDEBAR_DOCKS.RIGHT,
        COMPOSITION_SIDEBAR_DOCKS.TOP,
        COMPOSITION_SIDEBAR_DOCKS.BOTTOM,
        COMPOSITION_SIDEBAR_DOCKS.HEADER
      ],
      collapsedSize: { w: 4, h: 2 },
      overlayKeepsDeclaredArea: true
    },
    canMove: true,
    canShrink: true,
    canWrap: true,
    canStack: true,
    canDetachFromGroup: false,
    overflowStrategy: "move-to-side-or-stack",
    fallbackOrder: ["keep-side-role", "move-below-content", "stack-after-content", "reject"],
    v4: {
      ...COMMON_V4_LIMITS,
      internalGrid: "vertical-panel"
    }
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.CONTENT]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.CONTENT,
    role: COMPOSITION_BLOCK_ROLES.CENTER_CONTENT,
    priority: 90,
    minSize: { w: 8, h: 6 },
    anchors: [COMPOSITION_BEHAVIOR_ANCHORS.CENTER, COMPOSITION_BEHAVIOR_ANCHORS.FLOW],
    canMove: true,
    canShrink: true,
    canWrap: true,
    canStack: true,
    canDetachFromGroup: false,
    overflowStrategy: "preserve-main-meaning",
    fallbackOrder: ["keep-main-content-visible", "stack-related-sidebars", "compact-content", "reject"],
    v4: {
      ...COMMON_V4_LIMITS,
      internalGrid: "content-workspace"
    }
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.CONTROL]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.CONTROL,
    role: COMPOSITION_BLOCK_ROLES.CONTENT_BLOCK,
    priority: 60,
    minSize: { w: 4, h: 2 },
    anchors: [COMPOSITION_BEHAVIOR_ANCHORS.CURRENT_POSITION, COMPOSITION_BEHAVIOR_ANCHORS.FLOW],
    canMove: true,
    canShrink: true,
    canWrap: true,
    canStack: true,
    canDetachFromGroup: false,
    overflowStrategy: "stay-near-controlled-content",
    fallbackOrder: ["stay-with-dependency", "stack-after-content", "reject"],
    v4: {
      ...COMMON_V4_LIMITS,
      internalGrid: "controls"
    }
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.WARNING]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.WARNING,
    role: COMPOSITION_BLOCK_ROLES.CONTENT_BLOCK,
    priority: 70,
    minSize: { w: 4, h: 2 },
    anchors: [COMPOSITION_BEHAVIOR_ANCHORS.CURRENT_POSITION, COMPOSITION_BEHAVIOR_ANCHORS.FLOW],
    canMove: true,
    canShrink: true,
    canWrap: true,
    canStack: true,
    canDetachFromGroup: false,
    overflowStrategy: "stay-visible-but-not-dominant",
    fallbackOrder: ["stay-near-context", "stack-after-content", "compact-warning", "reject"],
    v4: {
      ...COMMON_V4_LIMITS,
      internalGrid: "message"
    }
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.FULL_WIDTH]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.FULL_WIDTH,
    role: COMPOSITION_BLOCK_ROLES.FULL_WIDTH,
    priority: 85,
    minSize: { w: 8, h: 2 },
    anchors: [COMPOSITION_BEHAVIOR_ANCHORS.TOP_WIDTH, COMPOSITION_BEHAVIOR_ANCHORS.BOTTOM_BAND],
    canWrap: false,
    canStack: false,
    overflowStrategy: "preserve-horizontal-span",
    fallbackOrder: ["keep-full-width", "compact-height", "reject"]
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.FULL_HEIGHT]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.FULL_HEIGHT,
    role: COMPOSITION_BLOCK_ROLES.FULL_HEIGHT,
    priority: 75,
    minSize: { w: 3, h: 8 },
    anchors: [COMPOSITION_BEHAVIOR_ANCHORS.LEFT_SIDE, COMPOSITION_BEHAVIOR_ANCHORS.RIGHT_SIDE],
    overflowStrategy: "preserve-vertical-span",
    fallbackOrder: ["keep-full-height", "move-to-side", "reject"]
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.EDGE_BOUND]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.EDGE_BOUND,
    role: COMPOSITION_BLOCK_ROLES.EDGE_BOUND,
    priority: 65,
    minSize: { w: 3, h: 3 },
    anchors: [COMPOSITION_BEHAVIOR_ANCHORS.CURRENT_EDGE],
    overflowStrategy: "keep-edge-relation",
    fallbackOrder: ["keep-nearest-edge", "move-inside-grid", "reject"]
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.CENTER_CONTENT]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.CENTER_CONTENT,
    role: COMPOSITION_BLOCK_ROLES.CENTER_CONTENT,
    priority: 70,
    minSize: { w: 5, h: 4 },
    anchors: [COMPOSITION_BEHAVIOR_ANCHORS.CENTER],
    overflowStrategy: "keep-center-meaning",
    fallbackOrder: ["keep-center-zone", "stack-in-flow", "reject"]
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.UTILITY]: {
    ...baseProfile,
    id: COMPOSITION_BEHAVIOR_PROFILE_IDS.UTILITY,
    role: COMPOSITION_BLOCK_ROLES.UTILITY,
    priority: 40,
    minSize: { w: 1, h: 1 },
    anchors: [COMPOSITION_BEHAVIOR_ANCHORS.CURRENT_POSITION],
    canShrink: false,
    overflowStrategy: "keep-near-parent",
    fallbackOrder: ["stay-near-parent", "hide-only-by-host-rule", "reject"],
    v4: {
      ...COMMON_V4_LIMITS,
      internalGrid: "inline-tool",
      requiresContentMeasure: false
    }
  },
  [COMPOSITION_BEHAVIOR_PROFILE_IDS.UNKNOWN]: {
    ...baseProfile
  }
};

export function getCompositionBehaviorProfile(profileId) {
  const profile = COMPOSITION_BEHAVIOR_PROFILES[profileId] ?? COMPOSITION_BEHAVIOR_PROFILES.unknown;
  return cloneProfile(profile);
}

export function resolveCompositionBehaviorProfileId({ block, role, contentSchema } = {}) {
  const type = String(contentSchema?.type ?? block?.contentSchema?.type ?? "").toLowerCase();

  if (type === "header") {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.HEADER;
  }

  if (type === "sidebar") {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.SIDEBAR;
  }

  if (type === "content") {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.CONTENT;
  }

  if (type === "control") {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.CONTROL;
  }

  if (type === "warning") {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.WARNING;
  }

  const resolvedRole = role ?? block?.role;

  if (resolvedRole === COMPOSITION_BLOCK_ROLES.FULL_WIDTH) {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.FULL_WIDTH;
  }

  if (resolvedRole === COMPOSITION_BLOCK_ROLES.FULL_HEIGHT) {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.FULL_HEIGHT;
  }

  if (resolvedRole === COMPOSITION_BLOCK_ROLES.EDGE_BOUND || resolvedRole === COMPOSITION_BLOCK_ROLES.CORNER_BOUND) {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.EDGE_BOUND;
  }

  if (resolvedRole === COMPOSITION_BLOCK_ROLES.CENTER_CONTENT || resolvedRole === COMPOSITION_BLOCK_ROLES.CONTENT_BLOCK) {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.CENTER_CONTENT;
  }

  if (resolvedRole === COMPOSITION_BLOCK_ROLES.UTILITY) {
    return COMPOSITION_BEHAVIOR_PROFILE_IDS.UTILITY;
  }

  return COMPOSITION_BEHAVIOR_PROFILE_IDS.UNKNOWN;
}

function cloneProfile(profile) {
  return {
    ...profile,
    minSize: { ...profile.minSize },
    anchors: [...profile.anchors],
    layout: { ...profile.layout },
    sidebar: profile.sidebar ? cloneSidebarBehavior(profile.sidebar) : undefined,
    fallbackOrder: [...profile.fallbackOrder],
    v4: { ...profile.v4 }
  };
}

function cloneSidebarBehavior(sidebar) {
  return {
    ...sidebar,
    modes: sidebar.modes.map((mode) => ({ ...mode })),
    docks: [...sidebar.docks],
    collapsedSize: { ...sidebar.collapsedSize }
  };
}
