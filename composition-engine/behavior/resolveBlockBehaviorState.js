import {
  COMPOSITION_BEHAVIOR_LAYERS,
  COMPOSITION_BEHAVIOR_PROFILE_IDS,
  COMPOSITION_SIDEBAR_MODES
} from "./compositionBehaviorProfiles.js";
import {
  COMPOSITION_DEVICE_PROFILES,
  resolveCompositionDeviceProfile
} from "../contracts/compositionDeviceProfiles.js";

export const COMPOSITION_BEHAVIOR_STATE_TYPES = {
  STATIC_LAYOUT: "static-layout",
  OVERLAY_AVAILABLE: "overlay-available",
  COLLAPSE_CANDIDATE: "collapse-candidate",
  STACK_CANDIDATE: "stack-candidate",
  BLOCKED_BY_CONTENT: "blocked-by-content",
  UNKNOWN: "unknown"
};

export function resolveBlockBehaviorState({ block, behavior, context } = {}) {
  const metrics = context?.metrics ?? {};
  const deviceProfile = resolveCompositionDeviceProfile(metrics);
  const area = normalizeArea(block?.area);
  const minSize = normalizeSize(behavior?.minSize, { w: 1, h: 1 });
  const layoutMode = resolveLayoutMode(behavior);
  const fitsCurrentSize = area.w >= minSize.w && area.h >= minSize.h;
  const reasons = [];

  if (!behavior || !block) {
    return createState({
      type: COMPOSITION_BEHAVIOR_STATE_TYPES.UNKNOWN,
      deviceProfile,
      area,
      minSize,
      layoutMode,
      fitsCurrentSize: false,
      reasons: ["missing-block-or-behavior"]
    });
  }

  if (!fitsCurrentSize) {
    reasons.push("area-smaller-than-min-size");
  }

  if (behavior.v4?.requiresContentMeasure) {
    reasons.push("needs-v4-content-measure");
  }

  if (behavior.id === COMPOSITION_BEHAVIOR_PROFILE_IDS.SIDEBAR) {
    return resolveSidebarState({
      block,
      behavior,
      deviceProfile,
      area,
      minSize,
      layoutMode,
      fitsCurrentSize,
      reasons
    });
  }

  if (!fitsCurrentSize) {
    return createState({
      type: COMPOSITION_BEHAVIOR_STATE_TYPES.BLOCKED_BY_CONTENT,
      deviceProfile,
      area,
      minSize,
      layoutMode,
      fitsCurrentSize,
      reasons,
      blocked: true
    });
  }

  const stackCandidate = behavior.canStack && deviceProfile !== COMPOSITION_DEVICE_PROFILES.DESKTOP;

  if (stackCandidate) {
    reasons.push("narrow-device-can-stack");
  }

  return createState({
    type: stackCandidate
      ? COMPOSITION_BEHAVIOR_STATE_TYPES.STACK_CANDIDATE
      : COMPOSITION_BEHAVIOR_STATE_TYPES.STATIC_LAYOUT,
    deviceProfile,
    area,
    minSize,
    layoutMode,
    fitsCurrentSize,
    reasons,
    canStack: Boolean(behavior.canStack),
    requiresV4Measure: Boolean(behavior.v4?.requiresContentMeasure)
  });
}

function resolveSidebarState({ block, behavior, deviceProfile, area, minSize, layoutMode, fitsCurrentSize, reasons }) {
  const modes = Array.isArray(behavior.sidebar?.modes) ? behavior.sidebar.modes : [];
  const hasMode = (modeId) => modes.some((mode) => mode.id === modeId);
  const canOverlay = hasMode(COMPOSITION_SIDEBAR_MODES.OVERLAY);
  const canCollapse = hasMode(COMPOSITION_SIDEBAR_MODES.COLLAPSIBLE) || hasMode(COMPOSITION_SIDEBAR_MODES.TRIGGER);
  const canDock = hasMode(COMPOSITION_SIDEBAR_MODES.DOCKABLE);
  const narrow = deviceProfile !== COMPOSITION_DEVICE_PROFILES.DESKTOP;
  const currentMode = modes.find((mode) => mode.id === behavior.sidebar?.defaultMode) ?? layoutMode;

  if (!fitsCurrentSize) {
    reasons.push("sidebar-smaller-than-min-size");
  }

  if (narrow && canCollapse) {
    reasons.push("sidebar-can-collapse-on-narrow-device");
  }

  if (narrow && canOverlay) {
    reasons.push("sidebar-can-be-overlay-on-narrow-device");
  }

  const recommendedMode = narrow
    ? canOverlay
      ? COMPOSITION_SIDEBAR_MODES.OVERLAY
      : canCollapse
        ? COMPOSITION_SIDEBAR_MODES.COLLAPSIBLE
        : currentMode.id
    : currentMode.id;

  const stateType = !fitsCurrentSize
    ? COMPOSITION_BEHAVIOR_STATE_TYPES.BLOCKED_BY_CONTENT
    : narrow && (canOverlay || canCollapse)
      ? COMPOSITION_BEHAVIOR_STATE_TYPES.COLLAPSE_CANDIDATE
      : currentMode.layer === COMPOSITION_BEHAVIOR_LAYERS.OVERLAY
        ? COMPOSITION_BEHAVIOR_STATE_TYPES.OVERLAY_AVAILABLE
        : COMPOSITION_BEHAVIOR_STATE_TYPES.STATIC_LAYOUT;

  return createState({
    type: stateType,
    deviceProfile,
    area,
    minSize,
    layoutMode: currentMode,
    fitsCurrentSize,
    reasons,
    blocked: !fitsCurrentSize,
    canOverlay,
    canCollapse,
    canDock,
    canStack: Boolean(behavior.canStack),
    recommendedMode,
    collapsedSize: normalizeSize(behavior.sidebar?.collapsedSize, null),
    overlayKeepsDeclaredArea: Boolean(behavior.sidebar?.overlayKeepsDeclaredArea),
    requiresV4Measure: Boolean(behavior.v4?.requiresContentMeasure)
  });
}

function createState({
  type,
  deviceProfile,
  area,
  minSize,
  layoutMode,
  fitsCurrentSize,
  reasons,
  blocked = false,
  canOverlay = false,
  canCollapse = false,
  canDock = false,
  canStack = false,
  recommendedMode = layoutMode?.id ?? null,
  collapsedSize = null,
  overlayKeepsDeclaredArea = false,
  requiresV4Measure = false
}) {
  return {
    type,
    deviceProfile,
    layer: layoutMode?.layer ?? COMPOSITION_BEHAVIOR_LAYERS.LAYOUT,
    mode: layoutMode?.id ?? null,
    recommendedMode,
    reservesSpace: Boolean(layoutMode?.reservesSpace),
    affectsContentFlow: Boolean(layoutMode?.affectsContentFlow),
    declaredAreaMeaning: layoutMode?.declaredAreaMeaning ?? null,
    currentArea: area,
    minSize,
    collapsedSize,
    fitsCurrentSize,
    blocked,
    canOverlay,
    canCollapse,
    canDock,
    canStack,
    overlayKeepsDeclaredArea,
    requiresV4Measure,
    reasons: [...new Set(reasons)]
  };
}

function resolveLayoutMode(behavior) {
  if (behavior?.layout) {
    return {
      id: behavior.layout.id ?? "layout",
      ...behavior.layout
    };
  }

  return {
    id: "layout",
    layer: COMPOSITION_BEHAVIOR_LAYERS.LAYOUT,
    reservesSpace: true,
    affectsContentFlow: true,
    declaredAreaMeaning: "reserved-layout-area"
  };
}

function normalizeArea(area) {
  return {
    x: Number(area?.x) || 0,
    y: Number(area?.y) || 0,
    w: Number(area?.w) || 0,
    h: Number(area?.h) || 0,
    right: Number(area?.right) || 0,
    bottom: Number(area?.bottom) || 0
  };
}

function normalizeSize(size, fallback) {
  if (!size && fallback === null) {
    return null;
  }

  const source = size ?? fallback;

  return {
    w: Number(source?.w) || 0,
    h: Number(source?.h) || 0
  };
}
