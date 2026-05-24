import { SIDEBAR_DOCKS } from "../contracts/sidebarDock.js";
import {
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_VIEWPORT_MODES
} from "../contracts/sidebarElementContract.js";
import { clampIconStripBarAreaToMetrics } from "../contracts/iconStripLayout.js";
import { SIDEBAR_STATES } from "../contracts/sidebarState.js";

export const SIDEBAR_FIXED_VIEWPORT_LAYOUT_MODES = {
  DECLARED: "declared",
  TOP_BAR: "top-bar"
};

const DEFAULT_COMPACT_FIXED_BAR_THICKNESS = 2;

export function resolveSidebarFixedViewportLayout({
  sidebar,
  state,
  viewportMode = SIDEBAR_VIEWPORT_MODES.DEFAULT,
  metrics = null
} = {}) {
  const expandedArea = normalizeArea(sidebar?.expandedArea);
  const sourceDock = sidebar?.dock ?? SIDEBAR_DOCKS.LEFT;

  if (state !== SIDEBAR_STATES.FIXED || !usesTopBarFixedLayout(viewportMode)) {
    return createLayout({
      mode: SIDEBAR_FIXED_VIEWPORT_LAYOUT_MODES.DECLARED,
      sourceDock,
      dock: sourceDock,
      renderArea: expandedArea
    });
  }

  const columns = normalizeGridSize(metrics?.columns, expandedArea.w);
  const rows = normalizeGridSize(metrics?.rows, expandedArea.h);
  const defaultTopBarRenderArea = {
    x: 1,
    y: 1,
    w: columns,
    h: resolveCompactFixedBarThickness({ expandedArea, metrics })
  };
  const renderArea = resolveMobileTopBarRenderArea({
    sidebar,
    defaultTopBarRenderArea,
    metrics: { columns, rows }
  });

  return createLayout({
    mode: SIDEBAR_FIXED_VIEWPORT_LAYOUT_MODES.TOP_BAR,
    sourceDock,
    dock: SIDEBAR_DOCKS.TOP,
    renderArea
  });
}

function resolveMobileTopBarRenderArea({
  sidebar,
  defaultTopBarRenderArea,
  metrics
} = {}) {
  if (sidebar?.mobileRenderStrategy === SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP) {
    return resolvePersistedTopBarRenderArea({
      storedArea: sidebar?.mobileLayout?.iconStrip?.barArea,
      defaultTopBarRenderArea,
      metrics
    });
  }

  if (sidebar?.mobileRenderStrategy === SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON) {
    return resolvePersistedTopBarRenderArea({
      storedArea: sidebar?.mobileLayout?.compactBarArea,
      defaultTopBarRenderArea,
      metrics
    });
  }

  return defaultTopBarRenderArea;
}

function resolvePersistedTopBarRenderArea({
  storedArea,
  defaultTopBarRenderArea,
  metrics
} = {}) {
  if (!storedArea) {
    return defaultTopBarRenderArea;
  }

  return clampIconStripBarAreaToMetrics(storedArea, metrics) ?? defaultTopBarRenderArea;
}

function createLayout({ mode, sourceDock, dock, renderArea }) {
  return {
    mode,
    sourceDock,
    dock,
    renderArea,
    reservedThickness: resolveThickness(renderArea, dock)
  };
}

function usesTopBarFixedLayout(viewportMode) {
  return (
    viewportMode === SIDEBAR_VIEWPORT_MODES.NARROW ||
    viewportMode === SIDEBAR_VIEWPORT_MODES.MOBILE
  );
}

function resolveCompactFixedBarThickness({ expandedArea, metrics }) {
  const rowsLimit = normalizeGridSize(metrics?.rows, expandedArea.h);
  const sourceLimit = normalizeGridSize(expandedArea.h, DEFAULT_COMPACT_FIXED_BAR_THICKNESS);
  const preferred = Math.min(DEFAULT_COMPACT_FIXED_BAR_THICKNESS, sourceLimit);

  return Math.max(1, Math.min(preferred, rowsLimit));
}

function resolveThickness(area, dock) {
  if (dock === SIDEBAR_DOCKS.LEFT || dock === SIDEBAR_DOCKS.RIGHT) {
    return normalizeGridSize(area?.w, 0);
  }

  return normalizeGridSize(area?.h, 0);
}

function normalizeArea(value) {
  return {
    x: normalizeGridNumber(value?.x, 1),
    y: normalizeGridNumber(value?.y, 1),
    w: normalizeGridSize(value?.w, 1),
    h: normalizeGridSize(value?.h, 1)
  };
}

function normalizeGridSize(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}

function normalizeGridNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? Math.round(number) : fallback;
}
