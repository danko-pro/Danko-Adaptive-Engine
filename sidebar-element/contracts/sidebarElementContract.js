import {
  normalizeSidebarContent,
  resolveSidebarContentRequiredGridSize
} from "./sidebarContent.js";
import { SIDEBAR_DOCKS, resolveSidebarDock } from "./sidebarDock.js";
import { SIDEBAR_STATES, resolveSidebarState } from "./sidebarState.js";

export const SIDEBAR_CONTRACT_VERSION = 3;

export const SIDEBAR_TRIGGERS = {
  CLICK: "click",
  HOVER: "hover",
  MANUAL: "manual",
  NONE: "none"
};

export const SIDEBAR_ANIMATIONS = {
  SLIDE: "slide",
  FADE: "fade",
  NONE: "none"
};

export const SIDEBAR_VIEWPORT_MODES = {
  DEFAULT: "default",
  NARROW: "narrow",
  MOBILE: "mobile"
};

export const SIDEBAR_MOBILE_RENDER_STRATEGIES = {
  COMPACT_MENU_BUTTON: "compact-menu-button",
  ICON_STRIP: "icon-strip"
};

export const DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY =
  SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON;

export const DEFAULT_SIDEBAR_MOBILE_LAYOUT = {
  compactButtonArea: null
};

export const DEFAULT_SIDEBAR_RESPONSIVE = {
  narrow: SIDEBAR_STATES.COLLAPSED,
  mobile: SIDEBAR_STATES.COLLAPSED
};

const KNOWN_TRIGGERS = new Set(Object.values(SIDEBAR_TRIGGERS));
const KNOWN_ANIMATIONS = new Set(Object.values(SIDEBAR_ANIMATIONS));
const KNOWN_MOBILE_RENDER_STRATEGIES = new Set(Object.values(SIDEBAR_MOBILE_RENDER_STRATEGIES));
const DEFAULT_AREA = { x: 1, y: 1, w: 1, h: 1 };

export function normalizeSidebarElementContract({
  item,
  sidebar,
  state,
  dock,
  defaultState = SIDEBAR_STATES.OVERLAY,
  defaultDock = SIDEBAR_DOCKS.LEFT,
  createdFromArea,
  syncExpandedArea = true
} = {}) {
  const previousSidebar = normalizeRecord(sidebar ?? item?.meta?.sidebar);
  const resolvedDock = resolveSidebarDock(dock ?? previousSidebar.dock, defaultDock);
  const resolvedState = resolveSidebarState(state ?? previousSidebar.state, defaultState);
  const content = normalizeSidebarContent(previousSidebar.content);
  const expandedArea = resolveExpandedArea({
    item,
    previousSidebar,
    content,
    syncExpandedArea
  });

  return {
    ...previousSidebar,
    version: SIDEBAR_CONTRACT_VERSION,
    dock: resolvedDock,
    state: resolvedState,
    expandedArea,
    collapsedSize: normalizeCollapsedSize(previousSidebar.collapsedSize),
    trigger: resolveSidebarTrigger(previousSidebar.trigger, SIDEBAR_TRIGGERS.CLICK),
    animation: resolveSidebarAnimation(previousSidebar.animation, SIDEBAR_ANIMATIONS.SLIDE),
    mobileRenderStrategy: resolveSidebarMobileRenderStrategy(previousSidebar.mobileRenderStrategy),
    mobileLayout: normalizeSidebarMobileLayout(previousSidebar.mobileLayout),
    responsive: normalizeSidebarResponsive(previousSidebar),
    content,
    createdFromArea: createdFromArea === undefined
      ? Boolean(previousSidebar.createdFromArea)
      : Boolean(createdFromArea)
  };
}

export function resolveSidebarTrigger(value, fallback = SIDEBAR_TRIGGERS.CLICK) {
  if (KNOWN_TRIGGERS.has(value)) {
    return value;
  }

  return KNOWN_TRIGGERS.has(fallback) ? fallback : SIDEBAR_TRIGGERS.CLICK;
}

export function resolveSidebarAnimation(value, fallback = SIDEBAR_ANIMATIONS.SLIDE) {
  if (KNOWN_ANIMATIONS.has(value)) {
    return value;
  }

  return KNOWN_ANIMATIONS.has(fallback) ? fallback : SIDEBAR_ANIMATIONS.SLIDE;
}

export function resolveSidebarMobileRenderStrategy(
  value,
  fallback = DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY
) {
  if (KNOWN_MOBILE_RENDER_STRATEGIES.has(value)) {
    return value;
  }

  return KNOWN_MOBILE_RENDER_STRATEGIES.has(fallback)
    ? fallback
    : DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY;
}

export function normalizeSidebarMobileLayout(value) {
  const layout = normalizeRecord(value);

  return {
    ...DEFAULT_SIDEBAR_MOBILE_LAYOUT,
    compactButtonArea: normalizeSidebarMobileButtonArea(layout.compactButtonArea)
  };
}

export function normalizeSidebarMobileButtonArea(value) {
  if (!isAreaLike(value)) {
    return null;
  }

  const x = normalizeOptionalGridNumber(value.x);
  const y = normalizeOptionalGridNumber(value.y);
  const w = normalizeOptionalGridNumber(value.w);
  const h = normalizeOptionalGridNumber(value.h);

  if ([x, y, w, h].some((number) => number === null)) {
    return null;
  }

  return {
    x: Math.max(1, x),
    y: Math.max(1, y),
    w: Math.max(1, w),
    h: Math.max(1, h)
  };
}

export function areSidebarElementContractsEqual(left, right) {
  return stableStringify(normalizeRecord(left)) === stableStringify(normalizeRecord(right));
}

function resolveExpandedArea({
  item,
  previousSidebar,
  content,
  syncExpandedArea
}) {
  const area = syncExpandedArea
    ? normalizeArea(item, previousSidebar.expandedArea)
    : normalizeArea(previousSidebar.expandedArea, item);

  return protectAreaBySidebarContent(area, content);
}

function protectAreaBySidebarContent(area, content) {
  const requiredSize = resolveSidebarContentRequiredGridSize(content);

  return {
    ...area,
    w: Math.max(area.w, requiredSize.columns),
    h: Math.max(area.h, requiredSize.rows)
  };
}

function normalizeArea(source, fallback = DEFAULT_AREA) {
  const fallbackArea = isAreaLike(fallback) ? fallback : DEFAULT_AREA;

  return {
    x: normalizeGridNumber(source?.x, fallbackArea.x),
    y: normalizeGridNumber(source?.y, fallbackArea.y),
    w: normalizeGridSize(source?.w, fallbackArea.w),
    h: normalizeGridSize(source?.h, fallbackArea.h)
  };
}

function normalizeCollapsedSize(value) {
  return {
    w: normalizeGridSize(value?.w, 1),
    h: normalizeGridSize(value?.h, 1)
  };
}

function normalizeSidebarResponsive(sidebar) {
  const responsive = normalizeRecord(sidebar?.responsive);
  const legacyMobileState = Number(sidebar?.version ?? 1) < SIDEBAR_CONTRACT_VERSION &&
    responsive.mobile === SIDEBAR_STATES.HIDDEN
    ? SIDEBAR_STATES.COLLAPSED
    : responsive.mobile;

  return {
    ...responsive,
    narrow: resolveResponsiveSidebarState(responsive.narrow, DEFAULT_SIDEBAR_RESPONSIVE.narrow),
    mobile: resolveResponsiveSidebarState(legacyMobileState, DEFAULT_SIDEBAR_RESPONSIVE.mobile)
  };
}

function resolveResponsiveSidebarState(value, fallback) {
  const state = resolveSidebarState(value, fallback);

  if (state === SIDEBAR_STATES.FIXED) {
    return resolveSidebarState(fallback, SIDEBAR_STATES.COLLAPSED);
  }

  return state;
}

function normalizeGridNumber(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.round(number);
}

function normalizeGridSize(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}

function normalizeOptionalGridNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.round(number);
}

function isAreaLike(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function normalizeRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function stableStringify(value) {
  return JSON.stringify(sortObject(value));
}

function sortObject(value) {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.keys(value).sort().reduce((accumulator, key) => {
    accumulator[key] = sortObject(value[key]);
    return accumulator;
  }, {});
}
