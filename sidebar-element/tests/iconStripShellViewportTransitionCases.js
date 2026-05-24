import assert from "node:assert/strict";
import {
  applySceneOperationCommand,
  createSidebarIconStripBarAreaOperation
} from "../../engine-adapter/index.js";
import { applySidebarContentItemCommand } from "../commands/applySidebarContentItemCommand.js";
import { SIDEBAR_CONTENT_GEOMETRY_TARGETS } from "../contracts/sidebarContentGeometryTarget.js";
import {
  DEFAULT_SIDEBAR_CONTENT_GRID,
  SIDEBAR_DOCKS,
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_MOBILE_PRESENTATION_MODES,
  SIDEBAR_STATES,
  SIDEBAR_VIEWPORT_MODES,
  resolveOperationRenderLayers,
  resolveSidebarRenderModel
} from "../index.js";

const desktopMetrics = { columns: 24, rows: 16 };
const mobileMetrics = {
  columns: 24,
  rows: 16,
  debug: {
    mode: "minimum",
    horizontalMode: "min-limit"
  }
};
const narrowMetrics = {
  columns: 24,
  rows: 16,
  debug: {
    mode: "compact-width",
    horizontalMode: "compact"
  }
};
const expandedArea = { x: 1, y: 3, w: 4, h: 10 };
const desktopContent = {
  grid: DEFAULT_SIDEBAR_CONTENT_GRID,
  items: [
    { id: "nav-home", x: 1, y: 1, w: 1, h: 1, text: "Home" },
    { id: "nav-about", x: 2, y: 1, w: 1, h: 1, text: "About" }
  ]
};

let sidebarItem = createFixedIconStripSidebar({
  content: desktopContent,
  mobileLayout: {
    compactButtonArea: null,
    iconStrip: {
      barArea: null,
      itemsById: {}
    }
  }
});

// 1. Desktop first: renderArea === expandedArea
const desktopRender = resolveSidebarRenderModel(sidebarItem, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.DEFAULT,
  metrics: desktopMetrics
});

assert.deepEqual(desktopRender.renderArea, expandedArea);
assert.deepEqual(desktopRender.expandedArea, expandedArea);
assert.equal(desktopRender.mobilePresentation.mode, SIDEBAR_MOBILE_PRESENTATION_MODES.NONE);

const desktopLayers = resolveOperationRenderLayers([sidebarItem], { metrics: desktopMetrics });
const desktopLayerInfo = desktopLayers.itemRenderInfoById.get(String(sidebarItem.id));

assert.deepEqual(desktopLayerInfo.renderArea, expandedArea);

// 2. Switch to mobile icon-strip: fallback h=2 when barArea absent
const mobileBeforeResize = resolveSidebarRenderModel(sidebarItem, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
  metrics: mobileMetrics
});

assert.equal(mobileBeforeResize.mobilePresentation.mode, SIDEBAR_MOBILE_PRESENTATION_MODES.ICON_STRIP);
assert.deepEqual(mobileBeforeResize.renderArea, { x: 1, y: 1, w: 24, h: 2 });
assert.deepEqual(mobileBeforeResize.expandedArea, expandedArea);

const narrowBeforeResize = resolveSidebarRenderModel(sidebarItem, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.NARROW,
  metrics: narrowMetrics
});

assert.deepEqual(narrowBeforeResize.renderArea, { x: 1, y: 1, w: 24, h: 2 });

// 3. Resize mobile icon-strip bar: persist barArea, mobile renderArea height changes
const resizeCommand = applySceneOperationCommand({
  items: [sidebarItem],
  operation: createSidebarIconStripBarAreaOperation({
    sidebarItemId: sidebarItem.id,
    area: { x: 1, y: 1, w: 24, h: 4 }
  }),
  metrics: mobileMetrics
});

assert.equal(resizeCommand.valid, true);
sidebarItem = resizeCommand.items[0];
assert.deepEqual(sidebarItem.meta.sidebar.mobileLayout.iconStrip.barArea, {
  x: 1,
  y: 1,
  w: 24,
  h: 4
});
assert.deepEqual(sidebarItem.meta.sidebar.expandedArea, expandedArea);
assert.deepEqual(pickItemFootprint(sidebarItem), expandedArea);

const mobileAfterResize = resolveSidebarRenderModel(sidebarItem, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
  metrics: mobileMetrics
});

assert.deepEqual(mobileAfterResize.renderArea, { x: 1, y: 1, w: 24, h: 4 });
assert.deepEqual(mobileAfterResize.expandedArea, expandedArea);

const mobileLayers = resolveOperationRenderLayers([sidebarItem], { metrics: mobileMetrics });
const mobileLayerInfo = mobileLayers.itemRenderInfoById.get(String(sidebarItem.id));

assert.deepEqual(mobileLayerInfo.renderArea, { x: 1, y: 1, w: 24, h: 4 });
assert.equal(mobileLayerInfo.mobilePresentation.mode, SIDEBAR_MOBILE_PRESENTATION_MODES.ICON_STRIP);

// barArea present overrides fallback even on narrow viewport
const narrowAfterResize = resolveSidebarRenderModel(sidebarItem, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.NARROW,
  metrics: narrowMetrics
});

assert.deepEqual(narrowAfterResize.renderArea, { x: 1, y: 1, w: 24, h: 4 });

// 4. Return desktop: expandedArea and renderArea unchanged
const desktopAfterFlow = resolveSidebarRenderModel(sidebarItem, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.DEFAULT,
  metrics: desktopMetrics
});

assert.deepEqual(desktopAfterFlow.renderArea, expandedArea);
assert.deepEqual(desktopAfterFlow.expandedArea, expandedArea);
assert.deepEqual(sidebarItem.meta.sidebar.expandedArea, expandedArea);

const desktopLayersAfter = resolveOperationRenderLayers([sidebarItem], { metrics: desktopMetrics });

assert.deepEqual(
  desktopLayersAfter.itemRenderInfoById.get(String(sidebarItem.id)).renderArea,
  expandedArea
);

// 5. Icon item geometry: only itemsById changes; barArea untouched
const barAreaBeforeItemMove = { ...sidebarItem.meta.sidebar.mobileLayout.iconStrip.barArea };
const iconMove = applySidebarContentItemCommand({
  item: sidebarItem,
  contentItemId: "nav-home",
  patch: { x: 8, y: 1, w: 2, h: 1 },
  geometryTarget: SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP,
  viewportArea: mobileAfterResize.renderArea
});

assert.equal(iconMove.valid, true);
assert.deepEqual(iconMove.item.meta.sidebar.mobileLayout.iconStrip.itemsById["nav-home"], {
  x: 8,
  y: 1,
  w: 2,
  h: 1
});
assert.deepEqual(iconMove.item.meta.sidebar.mobileLayout.iconStrip.barArea, barAreaBeforeItemMove);
assert.deepEqual(iconMove.item.meta.sidebar.expandedArea, expandedArea);
assert.deepEqual(pickContentGeometry(iconMove.item.meta.sidebar.content.items, "nav-home"), {
  x: 1,
  y: 1,
  w: 1,
  h: 1
});

const mobileAfterItemMove = resolveSidebarRenderModel(iconMove.item, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
  metrics: mobileMetrics
});

assert.deepEqual(mobileAfterItemMove.renderArea, barAreaBeforeItemMove);

// 6. Compact mode: compactButtonArea path; iconStrip.barArea ignored for renderArea
const compactSidebar = createFixedIconStripSidebar({
  mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
  mobileLayout: {
    compactButtonArea: { x: 20, y: 1, w: 2, h: 2 },
    iconStrip: {
      barArea: { x: 1, y: 1, w: 24, h: 4 },
      itemsById: {}
    }
  },
  content: desktopContent
});
const compactMobile = resolveSidebarRenderModel(compactSidebar, {
  viewportMode: SIDEBAR_VIEWPORT_MODES.MOBILE,
  metrics: mobileMetrics
});

assert.equal(compactMobile.mobilePresentation.mode, SIDEBAR_MOBILE_PRESENTATION_MODES.COMPACT_MENU_BUTTON);
assert.deepEqual(compactMobile.renderArea, { x: 1, y: 1, w: 24, h: 2 });
assert.deepEqual(compactMobile.mobilePresentation.buttonArea, { x: 20, y: 1, w: 2, h: 2 });
assert.deepEqual(compactMobile.expandedArea, expandedArea);

console.log("icon strip shell viewport transition tests passed");

function createFixedIconStripSidebar(sidebarPatch = {}) {
  const {
    mobileRenderStrategy = SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    mobileLayout,
    content,
    ...restSidebarPatch
  } = sidebarPatch;

  return {
    id: "fixed-left-icon-strip",
    ...expandedArea,
    meta: {
      blockType: "sidebar",
      sidebar: {
        dock: SIDEBAR_DOCKS.LEFT,
        state: SIDEBAR_STATES.FIXED,
        expandedArea,
        mobileRenderStrategy,
        mobileLayout,
        content,
        ...restSidebarPatch
      }
    }
  };
}

function pickItemFootprint(item) {
  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}

function pickContentGeometry(items, contentItemId) {
  const item = items.find((entry) => entry.id === contentItemId);

  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}
