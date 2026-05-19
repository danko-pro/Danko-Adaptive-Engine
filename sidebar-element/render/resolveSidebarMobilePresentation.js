import {
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_VIEWPORT_MODES
} from "../contracts/sidebarElementContract.js";
import { SIDEBAR_DOCKS } from "../contracts/sidebarDock.js";
import { SIDEBAR_STATES } from "../contracts/sidebarState.js";

const COMPACT_MENU_BUTTON_PREFERRED_SIZE = 2;

export const SIDEBAR_MOBILE_PRESENTATION_MODES = {
  NONE: "none",
  COMPACT_MENU_BUTTON: "compact-menu-button",
  ICON_STRIP: "icon-strip"
};

export function resolveSidebarMobilePresentation({
  state,
  viewportMode,
  areaMode,
  renderArea,
  mobileRenderStrategy,
  mobileLayout,
  sourceDock
} = {}) {
  const strategy = mobileRenderStrategy ?? SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON;

  if (!usesMobilePresentationViewport(viewportMode)) {
    return createPresentation({
      mode: SIDEBAR_MOBILE_PRESENTATION_MODES.NONE,
      strategy
    });
  }

  if (strategy === SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP) {
    return createPresentation({
      mode: SIDEBAR_MOBILE_PRESENTATION_MODES.ICON_STRIP,
      strategy
    });
  }

  if (strategy !== SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON) {
    return createPresentation({
      mode: SIDEBAR_MOBILE_PRESENTATION_MODES.NONE,
      strategy
    });
  }

  if (!usesCompactMenuButtonArea({ state, areaMode })) {
    return createPresentation({
      mode: SIDEBAR_MOBILE_PRESENTATION_MODES.NONE,
      strategy
    });
  }

  const buttonArea = resolveCompactMenuButtonArea({
    renderArea,
    compactButtonArea: mobileLayout?.compactButtonArea,
    sourceDock
  });

  if (!buttonArea) {
    return createPresentation({
      mode: SIDEBAR_MOBILE_PRESENTATION_MODES.NONE,
      strategy
    });
  }

  return createPresentation({
    mode: SIDEBAR_MOBILE_PRESENTATION_MODES.COMPACT_MENU_BUTTON,
    buttonArea,
    strategy
  });
}

function usesMobilePresentationViewport(viewportMode) {
  return (
    viewportMode === SIDEBAR_VIEWPORT_MODES.NARROW ||
    viewportMode === SIDEBAR_VIEWPORT_MODES.MOBILE
  );
}

function usesCompactMenuButtonArea({ state, areaMode }) {
  if (areaMode === "collapsed") {
    return true;
  }

  return areaMode === "expanded" && state === SIDEBAR_STATES.FIXED;
}

function resolveCompactMenuButtonArea({
  renderArea,
  compactButtonArea,
  sourceDock
} = {}) {
  const area = normalizeArea(renderArea);

  if (!area) {
    return null;
  }

  const manualArea = normalizeArea(compactButtonArea);

  if (manualArea) {
    return resolveManualCompactMenuButtonArea({
      renderArea: area,
      compactButtonArea: manualArea
    });
  }

  const w = Math.min(area.w, COMPACT_MENU_BUTTON_PREFERRED_SIZE);
  const h = Math.min(area.h, COMPACT_MENU_BUTTON_PREFERRED_SIZE);

  return {
    x: resolveCompactMenuButtonX({ area, sourceDock, w }),
    y: area.y,
    w,
    h
  };
}

function resolveManualCompactMenuButtonArea({
  renderArea,
  compactButtonArea
}) {
  const w = Math.min(compactButtonArea.w, renderArea.w);
  const h = Math.min(compactButtonArea.h, renderArea.h);
  const relativeX = clampGridNumber(compactButtonArea.x, 1, renderArea.w - w + 1);
  const relativeY = clampGridNumber(compactButtonArea.y, 1, renderArea.h - h + 1);

  return {
    x: renderArea.x + relativeX - 1,
    y: renderArea.y + relativeY - 1,
    w,
    h
  };
}

function resolveCompactMenuButtonX({ area, sourceDock, w }) {
  if (sourceDock === SIDEBAR_DOCKS.LEFT) {
    return area.x;
  }

  return area.x + area.w - w;
}

function clampGridNumber(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function normalizeArea(value) {
  const x = normalizeGridNumber(value?.x);
  const y = normalizeGridNumber(value?.y);
  const w = normalizeGridSize(value?.w);
  const h = normalizeGridSize(value?.h);

  if (!x || !y || !w || !h) {
    return null;
  }

  return { x, y, w, h };
}

function normalizeGridNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.max(1, Math.round(number));
}

function normalizeGridSize(value) {
  const number = normalizeGridNumber(value);

  return number ? Math.max(1, number) : null;
}

function createPresentation({
  mode,
  buttonArea = null,
  contentArea = null,
  strategy
}) {
  return {
    mode,
    buttonArea,
    contentArea,
    strategy
  };
}
