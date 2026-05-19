import {
  SIDEBAR_LAYERS,
  SIDEBAR_RENDER_MODES,
  createSidebarSceneProjection,
  resolveSidebarRenderModel,
  resolveSidebarViewportModeFromMetrics
} from "../../../sidebar-element/index.js";

export const OPERATION_RENDER_LAYER_IDS = {
  LAYOUT: "layout",
  OVERLAY: "overlay",
  CONTROLS: "controls",
  MENUS: "menus",
  DEBUG: "debug"
};

export function resolveOperationRenderLayers(items = [], { metrics = null } = {}) {
  const projection = createSidebarSceneProjection(items);
  const renderIds = new Set(projection.renderItems.map((item) => String(item.id)));
  const itemRenderInfoById = new Map();
  const viewportMode = resolveSidebarViewportModeFromMetrics(metrics);

  for (const item of projection.items) {
    const itemId = String(item.id);
    const policy = projection.policyById.get(itemId);
    const sidebarRenderModel = resolveSidebarRenderModel(item, { viewportMode, metrics });
    const hidden = !renderIds.has(itemId) || Boolean(sidebarRenderModel?.hidden);

    itemRenderInfoById.set(itemId, {
      layer: sidebarRenderModel?.layer ?? policy?.layer ?? SIDEBAR_LAYERS.LAYOUT,
      renderMode: sidebarRenderModel?.renderMode ?? policy?.renderMode ?? SIDEBAR_RENDER_MODES.VISIBLE,
      state: sidebarRenderModel?.state ?? policy?.state ?? null,
      areaMode: sidebarRenderModel?.areaMode ?? "expanded",
      viewportMode,
      viewportLayout: sidebarRenderModel?.viewportLayout ?? null,
      renderArea: hidden ? null : sidebarRenderModel?.renderArea ?? resolveItemArea(item),
      expandedArea: sidebarRenderModel?.expandedArea ?? resolveItemArea(item),
      sidebar: sidebarRenderModel?.sidebar ?? null,
      mobileRenderStrategy: sidebarRenderModel?.mobileRenderStrategy ?? null,
      mobilePresentation: sidebarRenderModel?.mobilePresentation ?? null,
      trigger: sidebarRenderModel?.trigger ?? null,
      animation: sidebarRenderModel?.animation ?? null,
      hidden
    });
  }

  const visibleItems = projection.items.filter((item) => (
    !itemRenderInfoById.get(String(item.id))?.hidden
  ));
  const layoutItems = visibleItems.filter((item) => (
    itemRenderInfoById.get(String(item.id))?.layer === SIDEBAR_LAYERS.LAYOUT
  ));
  const overlayItems = visibleItems.filter((item) => (
    itemRenderInfoById.get(String(item.id))?.layer === SIDEBAR_LAYERS.OVERLAY
  ));

  return {
    itemLayers: [
      {
        id: OPERATION_RENDER_LAYER_IDS.LAYOUT,
        items: layoutItems
      },
      {
        id: OPERATION_RENDER_LAYER_IDS.OVERLAY,
        items: overlayItems
      }
    ],
    controlsLayer: {
      id: OPERATION_RENDER_LAYER_IDS.CONTROLS
    },
    menuLayer: {
      id: OPERATION_RENDER_LAYER_IDS.MENUS
    },
    layoutItems,
    overlayItems,
    hiddenItems: projection.hiddenItems,
    viewportMode,
    itemRenderInfoById
  };
}

function resolveItemArea(item) {
  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}
