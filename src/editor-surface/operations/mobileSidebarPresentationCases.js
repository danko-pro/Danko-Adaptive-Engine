import assert from "node:assert/strict";
import {
  MOBILE_SIDEBAR_MENU_BUTTON_LABELS,
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES,
  isMobileCompactSidebarShell,
  resolveMobileSidebarMenuButtonState,
  resolveMobileSidebarContentRenderMode,
  resolveMobileSidebarShellClassName,
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_STATES,
  resolveOperationRenderLayers
} from "../../../sidebar-element/index.js";
import {
  resolveSidebarOperationContentSurface,
  SIDEBAR_OPERATION_CONTENT_SURFACES
} from "./resolveSidebarOperationContentSurface.js";

const compactPresentation = {
  mode: "compact-menu-button",
  buttonArea: {
    x: 1,
    y: 1,
    w: 1,
    h: 1
  }
};
const closedButtonState = resolveMobileSidebarMenuButtonState({
  presentation: compactPresentation,
  open: false
});

assert.equal(closedButtonState.visible, true);
assert.equal(closedButtonState.label, MOBILE_SIDEBAR_MENU_BUTTON_LABELS.CLOSED);
assert.equal(closedButtonState.glyph, "☰");
assert.equal(closedButtonState.className, "grid-operation-mobile-sidebar-menu-button");

const openButtonState = resolveMobileSidebarMenuButtonState({
  presentation: compactPresentation,
  open: true
});

assert.equal(openButtonState.visible, true);
assert.equal(openButtonState.label, MOBILE_SIDEBAR_MENU_BUTTON_LABELS.OPEN);
assert.equal(openButtonState.glyph, "×");
assert.equal(openButtonState.className, "grid-operation-mobile-sidebar-menu-button is-open");

assert.equal(
  resolveMobileSidebarMenuButtonState({
    presentation: {
      mode: "icon-strip",
      buttonArea: {
        x: 1,
        y: 1,
        w: 1,
        h: 1
      }
    }
  }).visible,
  false
);
assert.equal(
  resolveMobileSidebarMenuButtonState({
    presentation: {
      mode: "compact-menu-button",
      buttonArea: null
    }
  }).visible,
  false
);

const renderInfoWithContent = {
  areaMode: "expanded",
  sidebar: {
    content: {
      items: [
        {
          id: "nav-layout"
        }
      ]
    }
  }
};

assert.equal(
  resolveMobileSidebarContentRenderMode({
    ...renderInfoWithContent,
    mobilePresentation: {
      mode: "none"
    }
  }),
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES.DESKTOP_CONTENT
);
assert.equal(
  resolveMobileSidebarContentRenderMode({
    ...renderInfoWithContent,
    mobilePresentation: compactPresentation
  }),
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES.COMPACT_BUTTON
);
assert.equal(
  isMobileCompactSidebarShell({
    ...renderInfoWithContent,
    mobilePresentation: compactPresentation
  }),
  true
);
assert.equal(
  resolveMobileSidebarShellClassName({
    ...renderInfoWithContent,
    mobilePresentation: compactPresentation
  }),
  "is-mobile-compact-sidebar-shell"
);
assert.equal(
  resolveMobileSidebarContentRenderMode({
    ...renderInfoWithContent,
    mobilePresentation: {
      mode: "icon-strip",
      buttonArea: null
    }
  }),
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES.ICON_STRIP_CONTENT
);
assert.equal(
  isMobileCompactSidebarShell({
    ...renderInfoWithContent,
    mobilePresentation: {
      mode: "icon-strip",
      buttonArea: null
    }
  }),
  false
);
assert.equal(
  resolveMobileSidebarShellClassName({
    ...renderInfoWithContent,
    mobilePresentation: {
      mode: "none"
    }
  }),
  ""
);
assert.equal(
  resolveMobileSidebarContentRenderMode({
    ...renderInfoWithContent,
    areaMode: "collapsed",
    mobilePresentation: {
      mode: "icon-strip",
      buttonArea: null
    }
  }),
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES.HIDDEN
);
assert.equal(
  resolveMobileSidebarContentRenderMode({
    areaMode: "expanded",
    mobilePresentation: {
      mode: "none"
    },
    sidebar: {
      content: {
        items: []
      }
    }
  }),
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES.HIDDEN
);

const desktopMetrics = {
  columns: 24,
  rows: 16,
  debug: {
    mode: "normal",
    horizontalMode: "normal"
  }
};
const mobileMetrics = {
  columns: 12,
  rows: 16,
  debug: {
    mode: "minimum",
    horizontalMode: "min-limit"
  }
};
const sidebarWithContent = createFixedSidebarWithContent();
const desktopLayers = resolveOperationRenderLayers([sidebarWithContent], { metrics: desktopMetrics });
const desktopRenderInfo = desktopLayers.itemRenderInfoById.get("sidebar-a");

assert.equal(desktopRenderInfo.mobilePresentation.mode, "none");
assert.equal(
  resolveMobileSidebarContentRenderMode(desktopRenderInfo),
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES.DESKTOP_CONTENT
);
assert.equal(
  resolveSidebarOperationContentSurface(desktopRenderInfo),
  SIDEBAR_OPERATION_CONTENT_SURFACES.DESKTOP_GRID
);

const mobileCompactLayers = resolveOperationRenderLayers([sidebarWithContent], { metrics: mobileMetrics });
const mobileCompactRenderInfo = mobileCompactLayers.itemRenderInfoById.get("sidebar-a");

assert.equal(mobileCompactRenderInfo.mobilePresentation.mode, "compact-menu-button");
assert.equal(
  resolveMobileSidebarContentRenderMode(mobileCompactRenderInfo),
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES.COMPACT_BUTTON
);
assert.equal(
  resolveSidebarOperationContentSurface(mobileCompactRenderInfo),
  SIDEBAR_OPERATION_CONTENT_SURFACES.COMPACT_BUTTON
);
assert.deepEqual(mobileCompactRenderInfo.renderArea, { x: 1, y: 1, w: 12, h: 2 });

const mobileIconStripSidebar = createFixedSidebarWithContent(SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP);
const mobileIconStripLayers = resolveOperationRenderLayers([mobileIconStripSidebar], { metrics: mobileMetrics });
const mobileIconStripRenderInfo = mobileIconStripLayers.itemRenderInfoById.get("sidebar-a");

assert.equal(
  mobileIconStripRenderInfo.mobileRenderStrategy,
  SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP
);
assert.equal(mobileIconStripRenderInfo.mobilePresentation.mode, "icon-strip");
assert.equal(mobileIconStripRenderInfo.mobilePresentation.buttonArea, null);
assert.equal(
  resolveMobileSidebarContentRenderMode(mobileIconStripRenderInfo),
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES.ICON_STRIP_CONTENT
);
assert.equal(
  resolveSidebarOperationContentSurface(mobileIconStripRenderInfo),
  SIDEBAR_OPERATION_CONTENT_SURFACES.ICON_STRIP
);
assert.deepEqual(mobileIconStripRenderInfo.renderArea, { x: 1, y: 1, w: 12, h: 2 });
assert.equal(mobileIconStripRenderInfo.sidebar.content.items.length, 1);

const emptyContentSidebar = createFixedSidebarWithContent(SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP, {
  items: []
});
const hiddenIconStripLayers = resolveOperationRenderLayers([emptyContentSidebar], { metrics: mobileMetrics });
const hiddenIconStripRenderInfo = hiddenIconStripLayers.itemRenderInfoById.get("sidebar-a");

assert.equal(
  resolveMobileSidebarContentRenderMode(hiddenIconStripRenderInfo),
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES.HIDDEN
);
assert.equal(
  resolveSidebarOperationContentSurface(hiddenIconStripRenderInfo),
  SIDEBAR_OPERATION_CONTENT_SURFACES.HIDDEN
);

console.log("mobile sidebar presentation tests passed");

function createFixedSidebarWithContent(
  mobileRenderStrategy = SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
  contentPatch = {}
) {
  return {
    id: "sidebar-a",
    x: 1,
    y: 1,
    w: 4,
    h: 8,
    meta: {
      blockType: "sidebar",
      sidebar: {
        state: SIDEBAR_STATES.FIXED,
        mobileRenderStrategy,
        content: {
          grid: {
            columns: 4,
            rows: 8,
            ...(contentPatch.grid ?? {})
          },
          items: contentPatch.items ?? [
            {
              id: "nav-layout",
              x: 1,
              y: 1,
              w: 4,
              h: 1,
              text: "Layout"
            }
          ]
        }
      }
    }
  };
}
