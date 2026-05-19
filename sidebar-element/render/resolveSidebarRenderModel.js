import { SIDEBAR_DOCKS } from "../contracts/sidebarDock.js";
import {
  SIDEBAR_VIEWPORT_MODES,
  normalizeSidebarElementContract
} from "../contracts/sidebarElementContract.js";
import { SIDEBAR_RENDER_MODES, resolveSidebarStatePolicy } from "../contracts/sidebarStatePolicy.js";
import { SIDEBAR_STATES, resolveSidebarState } from "../contracts/sidebarState.js";
import { resolveSidebarFixedViewportLayout } from "../layout/resolveSidebarFixedViewportLayout.js";
import { resolveSidebarMobilePresentation } from "./resolveSidebarMobilePresentation.js";

export const SIDEBAR_RENDER_AREA_MODES = {
  EXPANDED: "expanded",
  COLLAPSED: "collapsed",
  HIDDEN: "hidden"
};

export function resolveSidebarRenderModel(item, {
  viewportMode = SIDEBAR_VIEWPORT_MODES.DEFAULT,
  metrics = null
} = {}) {
  if (!isSidebarItem(item)) {
    return null;
  }

  const sidebar = normalizeSidebarElementContract({
    item,
    syncExpandedArea: true
  });
  const state = resolveResponsiveState(sidebar, viewportMode);
  const policy = resolveSidebarStatePolicy(state);
  const viewportLayout = resolveSidebarFixedViewportLayout({
    sidebar,
    state,
    viewportMode,
    metrics
  });

  if (policy.renderMode === SIDEBAR_RENDER_MODES.HIDDEN) {
    return createRenderModel({
      item,
      sidebar,
      state,
      policy,
      viewportMode,
      viewportLayout,
      areaMode: SIDEBAR_RENDER_AREA_MODES.HIDDEN,
      renderArea: resolveCollapsedArea(sidebar),
      hidden: false
    });
  }

  if (policy.renderMode === SIDEBAR_RENDER_MODES.COLLAPSED) {
    return createRenderModel({
      item,
      sidebar,
      state,
      policy,
      viewportMode,
      viewportLayout,
      areaMode: SIDEBAR_RENDER_AREA_MODES.COLLAPSED,
      renderArea: resolveCollapsedArea(sidebar),
      hidden: false
    });
  }

  return createRenderModel({
    item,
    sidebar,
    state,
    policy,
    viewportMode,
    viewportLayout,
    areaMode: SIDEBAR_RENDER_AREA_MODES.EXPANDED,
    renderArea: viewportLayout.renderArea,
    hidden: false
  });
}

function createRenderModel({
  item,
  sidebar,
  state,
  policy,
  viewportMode,
  viewportLayout,
  areaMode,
  renderArea,
  hidden
}) {
  return {
    itemId: String(item?.id ?? ""),
    sidebar,
    state,
    layer: policy.layer,
    renderMode: policy.renderMode,
    areaMode,
    viewportMode,
    viewportLayout,
    expandedArea: sidebar.expandedArea,
    renderArea,
    mobileRenderStrategy: sidebar.mobileRenderStrategy,
    mobilePresentation: resolveSidebarMobilePresentation({
      sidebar,
      state,
      viewportMode,
      areaMode,
      renderArea,
      mobileRenderStrategy: sidebar.mobileRenderStrategy
    }),
    hidden,
    trigger: sidebar.trigger,
    animation: sidebar.animation
  };
}

function resolveResponsiveState(sidebar, viewportMode) {
  if (sidebar.state === SIDEBAR_STATES.FIXED) {
    return sidebar.state;
  }

  if (viewportMode === SIDEBAR_VIEWPORT_MODES.MOBILE) {
    return resolveSidebarState(sidebar.responsive?.mobile, sidebar.state);
  }

  if (viewportMode === SIDEBAR_VIEWPORT_MODES.NARROW) {
    return resolveSidebarState(sidebar.responsive?.narrow, sidebar.state);
  }

  return sidebar.state;
}

function resolveCollapsedArea(sidebar) {
  const expandedArea = normalizeArea(sidebar.expandedArea);
  const collapsedSize = {
    w: clampSize(sidebar.collapsedSize?.w, expandedArea.w),
    h: clampSize(sidebar.collapsedSize?.h, expandedArea.h)
  };

  if (sidebar.dock === SIDEBAR_DOCKS.RIGHT) {
    return {
      x: expandedArea.x + expandedArea.w - collapsedSize.w,
      y: expandedArea.y,
      ...collapsedSize
    };
  }

  if (sidebar.dock === SIDEBAR_DOCKS.BOTTOM) {
    return {
      x: expandedArea.x,
      y: expandedArea.y + expandedArea.h - collapsedSize.h,
      ...collapsedSize
    };
  }

  return {
    x: expandedArea.x,
    y: expandedArea.y,
    ...collapsedSize
  };
}

function normalizeArea(value) {
  return {
    x: normalizeNumber(value?.x, 1),
    y: normalizeNumber(value?.y, 1),
    w: Math.max(1, normalizeNumber(value?.w, 1)),
    h: Math.max(1, normalizeNumber(value?.h, 1))
  };
}

function clampSize(value, maxValue) {
  return Math.max(1, Math.min(normalizeNumber(value, 1), Math.max(1, maxValue)));
}

function normalizeNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function isSidebarItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === "sidebar" ||
    Boolean(item?.meta?.sidebar && typeof item.meta.sidebar === "object")
  );
}
