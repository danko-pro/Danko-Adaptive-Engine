import assert from "node:assert/strict";
import {
  SIDEBAR_CONTENT_ACTION_TYPES,
  SIDEBAR_CONTENT_FONT_FAMILIES,
  SIDEBAR_CONTENT_ITEM_TYPES,
  SIDEBAR_DOCKS,
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_STATES
} from "../../../sidebar-element/index.js";
import {
  OPERATION_RENDER_LAYER_IDS,
  resolveOperationRenderLayers
} from "./resolveOperationRenderLayers.js";
import { resolveOperationSidebarReservedBoundary } from "./resolveOperationSidebarReservedBoundary.js";

const fixedSidebar = {
  id: "fixed-sidebar",
  x: 1,
  y: 1,
  w: 4,
  h: 8,
  meta: {
    blockType: "sidebar",
    sidebar: {
      state: SIDEBAR_STATES.FIXED
    }
  }
};

const overlaySidebar = {
  id: "overlay-sidebar",
  x: 1,
  y: 1,
  w: 4,
  h: 8,
  meta: {
    blockType: "sidebar",
    sidebar: {
      state: SIDEBAR_STATES.OVERLAY
    }
  }
};

const hiddenSidebar = {
  id: "hidden-sidebar",
  x: 1,
  y: 1,
  w: 4,
  h: 8,
  meta: {
    blockType: "sidebar",
    sidebar: {
      state: SIDEBAR_STATES.HIDDEN
    }
  }
};

const collapsedSidebar = {
  id: "collapsed-sidebar",
  x: 20,
  y: 1,
  w: 4,
  h: 8,
  meta: {
    blockType: "sidebar",
    sidebar: {
      dock: "right",
      state: SIDEBAR_STATES.COLLAPSED,
      collapsedSize: {
        w: 1,
        h: 2
      }
    }
  }
};

const content = {
  id: "content",
  x: 6,
  y: 1,
  w: 4,
  h: 8,
  meta: {
    blockType: "content"
  }
};

const layers = resolveOperationRenderLayers([
  fixedSidebar,
  overlaySidebar,
  hiddenSidebar,
  collapsedSidebar,
  content
]);

assert.deepEqual(
  layers.itemLayers.map((layer) => layer.id),
  [OPERATION_RENDER_LAYER_IDS.LAYOUT, OPERATION_RENDER_LAYER_IDS.OVERLAY]
);
assert.deepEqual(
  layers.layoutItems.map((item) => item.id),
  ["fixed-sidebar", "content"]
);
assert.deepEqual(
  layers.itemLayers[0].items.map((item) => item.id),
  ["fixed-sidebar", "content"]
);
assert.deepEqual(
  layers.overlayItems.map((item) => item.id),
  ["overlay-sidebar", "hidden-sidebar", "collapsed-sidebar"]
);
assert.deepEqual(
  layers.itemLayers[1].items.map((item) => item.id),
  ["overlay-sidebar", "hidden-sidebar", "collapsed-sidebar"]
);
assert.deepEqual(
  layers.hiddenItems.map((item) => item.id),
  []
);
assert.equal(layers.controlsLayer.id, OPERATION_RENDER_LAYER_IDS.CONTROLS);
assert.equal(layers.menuLayer.id, OPERATION_RENDER_LAYER_IDS.MENUS);
assert.equal("items" in layers.controlsLayer, false);
assert.equal("items" in layers.menuLayer, false);
assert.equal(layers.itemRenderInfoById.get("fixed-sidebar").layer, "layout");
assert.equal(layers.itemRenderInfoById.get("fixed-sidebar").sidebar.dock, SIDEBAR_DOCKS.LEFT);
assert.equal(layers.itemRenderInfoById.get("overlay-sidebar").layer, "overlay");
assert.equal(layers.itemRenderInfoById.get("hidden-sidebar").renderMode, "hidden");
assert.equal(layers.itemRenderInfoById.get("hidden-sidebar").areaMode, "hidden");
assert.equal(layers.itemRenderInfoById.get("hidden-sidebar").hidden, false);
assert.deepEqual(layers.itemRenderInfoById.get("hidden-sidebar").renderArea, { x: 1, y: 1, w: 1, h: 1 });
assert.equal(layers.itemRenderInfoById.get("collapsed-sidebar").renderMode, "collapsed");
assert.deepEqual(layers.itemRenderInfoById.get("collapsed-sidebar").expandedArea, { x: 20, y: 1, w: 4, h: 8 });
assert.deepEqual(layers.itemRenderInfoById.get("collapsed-sidebar").renderArea, { x: 23, y: 1, w: 1, h: 2 });

const narrowLayers = resolveOperationRenderLayers([overlaySidebar], {
  metrics: {
    debug: {
      mode: "compact-width",
      horizontalMode: "compact"
    }
  }
});

assert.equal(narrowLayers.viewportMode, "narrow");
assert.equal(narrowLayers.itemRenderInfoById.get("overlay-sidebar").state, SIDEBAR_STATES.COLLAPSED);
assert.deepEqual(narrowLayers.itemRenderInfoById.get("overlay-sidebar").renderArea, { x: 1, y: 1, w: 1, h: 1 });

const mobileLayers = resolveOperationRenderLayers([fixedSidebar, overlaySidebar], {
  metrics: {
    columns: 12,
    rows: 16,
    debug: {
      mode: "minimum",
      horizontalMode: "min-limit"
    }
  }
});

assert.equal(mobileLayers.viewportMode, "mobile");
assert.equal(mobileLayers.itemRenderInfoById.get("fixed-sidebar").state, SIDEBAR_STATES.FIXED);
assert.equal(mobileLayers.itemRenderInfoById.get("fixed-sidebar").hidden, false);
assert.deepEqual(mobileLayers.itemRenderInfoById.get("fixed-sidebar").renderArea, { x: 1, y: 1, w: 12, h: 2 });
assert.equal(mobileLayers.itemRenderInfoById.get("fixed-sidebar").viewportLayout.mode, "top-bar");
assert.equal(
  mobileLayers.itemRenderInfoById.get("fixed-sidebar").mobileRenderStrategy,
  SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
);
assert.equal(
  mobileLayers.itemRenderInfoById.get("fixed-sidebar").mobilePresentation.mode,
  "compact-menu-button"
);
assert.deepEqual(
  mobileLayers.itemRenderInfoById.get("fixed-sidebar").mobilePresentation.buttonArea,
  { x: 1, y: 1, w: 2, h: 2 }
);
assert.equal(mobileLayers.itemRenderInfoById.get("overlay-sidebar").state, SIDEBAR_STATES.COLLAPSED);
assert.equal(mobileLayers.itemRenderInfoById.get("overlay-sidebar").hidden, false);
assert.deepEqual(mobileLayers.itemRenderInfoById.get("overlay-sidebar").renderArea, { x: 1, y: 1, w: 1, h: 1 });

const shortDesktopLayers = resolveOperationRenderLayers([overlaySidebar], {
  metrics: {
    debug: {
      mode: "minimum",
      horizontalMode: "normal",
      verticalMode: "min-limit"
    }
  }
});

assert.equal(shortDesktopLayers.viewportMode, "default");
assert.equal(shortDesktopLayers.itemRenderInfoById.get("overlay-sidebar").state, SIDEBAR_STATES.OVERLAY);
assert.deepEqual(shortDesktopLayers.itemRenderInfoById.get("overlay-sidebar").renderArea, { x: 1, y: 1, w: 4, h: 8 });
assert.equal(shortDesktopLayers.itemRenderInfoById.get("overlay-sidebar").mobilePresentation.mode, "none");

const desktopFixedLayers = resolveOperationRenderLayers([fixedSidebar], {
  metrics: {
    columns: 24,
    rows: 16,
    debug: {
      mode: "normal",
      horizontalMode: "normal"
    }
  }
});

assert.equal(desktopFixedLayers.itemRenderInfoById.get("fixed-sidebar").mobilePresentation.mode, "none");
assert.deepEqual(desktopFixedLayers.itemRenderInfoById.get("fixed-sidebar").renderArea, { x: 1, y: 1, w: 4, h: 8 });

const boundaryMetrics = {
  columns: 16,
  rows: 10
};

assert.deepEqual(
  resolveOperationSidebarReservedBoundary({ items: [createDockedFixedSidebar(SIDEBAR_DOCKS.LEFT, { w: 4 })], metrics: boundaryMetrics }),
  {
    boundaries: [
      {
        id: SIDEBAR_DOCKS.LEFT,
        orientation: "vertical",
        gridLine: 4,
        style: { left: "calc(var(--cell-size) * 4)" }
      }
    ],
    reservedArea: { left: 4, right: 0, top: 0, bottom: 0 },
    participants: [{ id: "fixed-left", dock: SIDEBAR_DOCKS.LEFT, thickness: 4 }],
    valid: true
  }
);
assert.deepEqual(
  resolveOperationSidebarReservedBoundary({
    items: [createDockedFixedSidebar(SIDEBAR_DOCKS.LEFT, { w: 4, h: 8 })],
    metrics: {
      ...boundaryMetrics,
      debug: {
        mode: "compact-width",
        horizontalMode: "compact"
      }
    }
  }),
  {
    boundaries: [
      {
        id: SIDEBAR_DOCKS.TOP,
        orientation: "horizontal",
        gridLine: 2,
        style: { top: "calc(var(--cell-size) * 2)" }
      }
    ],
    reservedArea: { left: 0, right: 0, top: 2, bottom: 0 },
    participants: [{ id: "fixed-left", dock: SIDEBAR_DOCKS.TOP, thickness: 2 }],
    valid: true
  }
);
assert.deepEqual(
  resolveOperationSidebarReservedBoundary({ items: [createDockedFixedSidebar(SIDEBAR_DOCKS.RIGHT, { x: 14, w: 3 })], metrics: boundaryMetrics }),
  {
    boundaries: [
      {
        id: SIDEBAR_DOCKS.RIGHT,
        orientation: "vertical",
        gridLine: 13,
        style: { left: "calc(var(--cell-size) * 13)" }
      }
    ],
    reservedArea: { left: 0, right: 3, top: 0, bottom: 0 },
    participants: [{ id: "fixed-right", dock: SIDEBAR_DOCKS.RIGHT, thickness: 3 }],
    valid: true
  }
);
assert.deepEqual(
  resolveOperationSidebarReservedBoundary({ items: [createDockedFixedSidebar(SIDEBAR_DOCKS.TOP, { h: 2 })], metrics: boundaryMetrics }),
  {
    boundaries: [
      {
        id: SIDEBAR_DOCKS.TOP,
        orientation: "horizontal",
        gridLine: 2,
        style: { top: "calc(var(--cell-size) * 2)" }
      }
    ],
    reservedArea: { left: 0, right: 0, top: 2, bottom: 0 },
    participants: [{ id: "fixed-top", dock: SIDEBAR_DOCKS.TOP, thickness: 2 }],
    valid: true
  }
);
assert.deepEqual(
  resolveOperationSidebarReservedBoundary({ items: [createDockedFixedSidebar(SIDEBAR_DOCKS.BOTTOM, { y: 8, h: 3 })], metrics: boundaryMetrics }),
  {
    boundaries: [
      {
        id: SIDEBAR_DOCKS.BOTTOM,
        orientation: "horizontal",
        gridLine: 7,
        style: { top: "calc(var(--cell-size) * 7)" }
      }
    ],
    reservedArea: { left: 0, right: 0, top: 0, bottom: 3 },
    participants: [{ id: "fixed-bottom", dock: SIDEBAR_DOCKS.BOTTOM, thickness: 3 }],
    valid: true
  }
);
assert.deepEqual(
  resolveOperationSidebarReservedBoundary({ items: [overlaySidebar], metrics: boundaryMetrics }),
  {
    boundaries: [],
    reservedArea: { left: 0, right: 0, top: 0, bottom: 0 },
    participants: [],
    valid: true
  }
);
assert.deepEqual(
  resolveOperationSidebarReservedBoundary({
    items: [
      {
        id: "legacy-sidebar-without-state",
        x: 1,
        y: 1,
        w: 4,
        h: 8,
        meta: {
          blockType: "sidebar"
        }
      }
    ],
    metrics: boundaryMetrics
  }),
  {
    boundaries: [],
    reservedArea: { left: 0, right: 0, top: 0, bottom: 0 },
    participants: [],
    valid: true
  }
);

const sidebarWithContentLayers = resolveOperationRenderLayers([
  {
    id: "sidebar-with-content",
    x: 1,
    y: 1,
    w: 4,
    h: 8,
    meta: {
      blockType: "sidebar",
      sidebar: {
        state: SIDEBAR_STATES.FIXED,
        content: {
          grid: {
            columns: 4,
            rows: 6
          },
          items: [
            {
              id: "nav-layout",
              type: SIDEBAR_CONTENT_ITEM_TYPES.NAVIGATION_ITEM,
              x: 1,
              y: 1,
              w: 4,
              h: 1,
              text: "Layout",
              active: true,
              action: {
                type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
                pageId: "layout-page"
              }
            }
          ]
        }
      }
    }
  }
]);

assert.deepEqual(
  sidebarWithContentLayers.itemRenderInfoById.get("sidebar-with-content").sidebar.content.items[0],
  {
    id: "nav-layout",
    type: SIDEBAR_CONTENT_ITEM_TYPES.NAVIGATION_ITEM,
    x: 1,
    y: 1,
    w: 4,
    h: 1,
    text: "Layout",
    active: true,
    action: {
      type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
      pageId: "layout-page",
      routeId: null,
      workspaceId: null
    },
    style: {
      fontSize: 14,
      fontWeight: 600,
      fontFamily: SIDEBAR_CONTENT_FONT_FAMILIES.SYSTEM,
      lineHeight: 1.2,
      align: "center"
    },
    textFit: "wrap"
  }
);

console.log("operation render layer tests passed");

function createDockedFixedSidebar(dock, area = {}) {
  return {
    id: `fixed-${dock}`,
    x: area.x ?? 1,
    y: area.y ?? 1,
    w: area.w ?? 4,
    h: area.h ?? 4,
    meta: {
      blockType: "sidebar",
      sidebar: {
        dock,
        state: SIDEBAR_STATES.FIXED
      }
    }
  };
}
