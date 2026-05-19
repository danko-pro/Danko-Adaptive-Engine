import {
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_VIEWPORT_MODES
} from "../contracts/sidebarElementContract.js";
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
  mobileRenderStrategy
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

  const buttonArea = resolveCompactMenuButtonArea(renderArea);

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

function resolveCompactMenuButtonArea(renderArea) {
  const area = normalizeArea(renderArea);

  if (!area) {
    return null;
  }

  return {
    x: area.x,
    y: area.y,
    w: Math.min(area.w, COMPACT_MENU_BUTTON_PREFERRED_SIZE),
    h: Math.min(area.h, COMPACT_MENU_BUTTON_PREFERRED_SIZE)
  };
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
