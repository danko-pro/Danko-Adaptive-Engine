import { SIDEBAR_LAYERS } from "../contracts/sidebarLayer.js";
import { sidebarStateReservesSpace } from "../contracts/sidebarStatePolicy.js";
import { SIDEBAR_FIXED_VIEWPORT_LAYOUT_MODES } from "../layout/resolveSidebarFixedViewportLayout.js";
import { resolveSidebarRenderModel } from "../render/resolveSidebarRenderModel.js";

export function resolveSidebarLayoutOccupancy(item, { viewportMode, metrics } = {}) {
  const model = resolveSidebarRenderModel(item, { viewportMode, metrics });

  if (!model || model.layer !== SIDEBAR_LAYERS.LAYOUT) {
    return null;
  }

  if (!sidebarStateReservesSpace(model.state)) {
    return null;
  }

  return normalizeArea(model.renderArea);
}

export function shouldPreserveSidebarSourceGeometry(item, { viewportMode, metrics } = {}) {
  const model = resolveSidebarRenderModel(item, { viewportMode, metrics });

  return model?.viewportLayout?.mode === SIDEBAR_FIXED_VIEWPORT_LAYOUT_MODES.TOP_BAR;
}

function normalizeArea(value) {
  return {
    x: normalizeNumber(value?.x, 1),
    y: normalizeNumber(value?.y, 1),
    w: Math.max(1, normalizeNumber(value?.w, 1)),
    h: Math.max(1, normalizeNumber(value?.h, 1))
  };
}

function normalizeNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? Math.round(number) : fallback;
}
