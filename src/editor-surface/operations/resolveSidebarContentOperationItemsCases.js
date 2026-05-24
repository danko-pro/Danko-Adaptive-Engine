import assert from "node:assert/strict";

import {
  createNavigationHostState,
  resolveItemsWithSidebarNavigationContent
} from "../../../engine-adapter/index.js";
import {
  SIDEBAR_CONTENT_ACTION_TYPES,
  SIDEBAR_CONTENT_GEOMETRY_TARGETS,
  applySidebarContentItemCommand,
  resolveMobileIconStripContent
} from "../../../sidebar-element/index.js";
import { resolveSidebarContentOperationItems } from "./resolveSidebarContentOperationItems.js";
const explicitContent = {
  grid: { columns: 4, rows: 20 },
  items: [
    {
      id: "sidebar-nav-checks",
      x: 1,
      y: 1,
      w: 4,
      h: 1,
      text: "Checks"
    }
  ]
};
const sourceItems = [
  {
    id: "sidebar-1",
    x: 1,
    y: 1,
    w: 4,
    h: 20,
    meta: {
      blockType: "sidebar",
      sidebar: {
        state: "fixed"
      }
    }
  },
  {
    id: "card-1",
    x: 5,
    y: 1,
    w: 2,
    h: 2,
    meta: {
      blockType: "card"
    }
  }
];

const withExplicitContent = resolveSidebarContentOperationItems({
  items: sourceItems,
  sidebarItem: {
    id: "sidebar-1",
    meta: {
      blockType: "sidebar"
    }
  },
  content: explicitContent
});

assert.notEqual(withExplicitContent, sourceItems);
assert.notEqual(withExplicitContent[0], sourceItems[0]);
assert.equal(withExplicitContent[1], sourceItems[1]);
assert.equal(withExplicitContent[0].meta.blockType, "sidebar");
assert.equal(withExplicitContent[0].meta.sidebar.state, "fixed");
assert.equal(
  withExplicitContent[0].meta.sidebar.content.items[0].id,
  "sidebar-nav-checks"
);
assert.equal(sourceItems[0].meta.sidebar.content, undefined);

const sidebarItemContent = {
  grid: { columns: 2, rows: 2 },
  items: [
    {
      id: "existing-button",
      x: 1,
      y: 1,
      w: 1,
      h: 1,
      text: "Existing"
    }
  ]
};
const withSidebarItemContent = resolveSidebarContentOperationItems({
  items: sourceItems,
  sidebarItem: {
    id: "sidebar-1",
    meta: {
      blockType: "sidebar",
      sidebar: {
        content: sidebarItemContent
      }
    }
  }
});

assert.equal(
  withSidebarItemContent[0].meta.sidebar.content.items[0].id,
  "existing-button"
);

const withoutContent = resolveSidebarContentOperationItems({
  items: sourceItems,
  sidebarItem: {
    id: "sidebar-1",
    meta: {
      blockType: "sidebar"
    }
  }
});

assert.equal(withoutContent, sourceItems);

const iconStripOverlayContent = {
  geometryTarget: SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP,
  grid: { columns: 4, rows: 1 },
  items: [
    {
      id: "strip-only",
      x: 1,
      y: 1,
      w: 1,
      h: 1,
      text: "Strip"
    }
  ]
};
const withIconStripOverlay = resolveSidebarContentOperationItems({
  items: sourceItems,
  sidebarItem: {
    id: "sidebar-1",
    meta: {
      blockType: "sidebar",
      sidebar: {
        content: sidebarItemContent
      }
    }
  },
  content: iconStripOverlayContent
});
const overlayOperationContent = withIconStripOverlay[0].meta.sidebar.content;
const overlayExistingItem = overlayOperationContent.items.find(
  (contentItem) => contentItem.id === "existing-button"
);
const overlayStripItem = overlayOperationContent.items.find(
  (contentItem) => contentItem.id === "strip-only"
);

assert.equal(overlayExistingItem?.text, "Existing");
assert.deepEqual(
  {
    x: overlayExistingItem?.x,
    y: overlayExistingItem?.y,
    w: overlayExistingItem?.w,
    h: overlayExistingItem?.h
  },
  { x: 1, y: 1, w: 1, h: 1 }
);
assert.equal(overlayStripItem?.text, "Strip");
assert.deepEqual(
  {
    x: overlayStripItem?.x,
    y: overlayStripItem?.y,
    w: overlayStripItem?.w,
    h: overlayStripItem?.h
  },
  { x: 1, y: 1, w: 1, h: 1 }
);
assert.equal(overlayOperationContent.geometryTarget, undefined);
assert.equal(overlayOperationContent.viewportArea, undefined);
assert.notEqual(overlayOperationContent, iconStripOverlayContent);

const storedNavLayoutContent = {
  grid: { columns: 4, rows: 20 },
  items: [
    {
      id: "nav-layout",
      x: 1,
      y: 8,
      w: 1,
      h: 1,
      text: "Old Layout"
    }
  ]
};
const renderedNavLayoutStrip = {
  geometryTarget: SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP,
  viewportArea: { x: 1, y: 1, w: 12, h: 2 },
  grid: { columns: 12, rows: 2 },
  items: [
    {
      id: "nav-layout",
      x: 7,
      y: 1,
      w: 2,
      h: 1,
      text: "Layout",
      action: {
        type: "select-page",
        pageId: "layout-page"
      }
    }
  ]
};
const withMergedNavLayoutStrip = resolveSidebarContentOperationItems({
  items: sourceItems,
  sidebarItem: {
    id: "sidebar-1",
    meta: {
      blockType: "sidebar",
      sidebar: {
        content: storedNavLayoutContent
      }
    }
  },
  content: renderedNavLayoutStrip
});
const mergedNavLayoutItem = withMergedNavLayoutStrip[0].meta.sidebar.content.items.find(
  (contentItem) => contentItem.id === "nav-layout"
);

assert.equal(mergedNavLayoutItem.text, "Layout");
assert.equal(mergedNavLayoutItem.action.pageId, "layout-page");
assert.deepEqual(
  {
    x: mergedNavLayoutItem.x,
    y: mergedNavLayoutItem.y,
    w: mergedNavLayoutItem.w,
    h: mergedNavLayoutItem.h
  },
  { x: 1, y: 8, w: 1, h: 1 }
);
assert.equal(withMergedNavLayoutStrip[0].meta.sidebar.content.geometryTarget, undefined);
assert.equal(withMergedNavLayoutStrip[0].meta.sidebar.content.viewportArea, undefined);

const renderedMissingStoredItemStrip = {
  geometryTarget: SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP,
  viewportArea: { x: 1, y: 1, w: 12, h: 2 },
  grid: { columns: 12, rows: 2 },
  items: [
    {
      id: "nav-checks",
      x: 4,
      y: 1,
      w: 2,
      h: 1,
      text: "Checks",
      action: {
        type: "select-page",
        pageId: "checks-page"
      }
    }
  ]
};
const withGeneratedNavChecksStrip = resolveSidebarContentOperationItems({
  items: sourceItems,
  sidebarItem: {
    id: "sidebar-1",
    meta: {
      blockType: "sidebar",
      sidebar: {
        content: {
          grid: { columns: 4, rows: 20 },
          items: []
        }
      }
    }
  },
  content: renderedMissingStoredItemStrip
});
const generatedNavChecksItem = withGeneratedNavChecksStrip[0].meta.sidebar.content.items.find(
  (contentItem) => contentItem.id === "nav-checks"
);

assert.equal(generatedNavChecksItem.text, "Checks");
assert.equal(generatedNavChecksItem.action.pageId, "checks-page");
assert.deepEqual(
  {
    x: generatedNavChecksItem.x,
    y: generatedNavChecksItem.y,
    w: generatedNavChecksItem.w,
    h: generatedNavChecksItem.h
  },
  { x: 1, y: 1, w: 1, h: 1 }
);

const navigationState = createNavigationHostState({
  metrics: { columns: 24, rows: 16 },
  activePageId: "content-page",
  pages: [
    {
      id: "layout-page",
      title: "Layout",
      routeId: "layout-route",
      workspaceId: "layout-workspace"
    },
    {
      id: "content-page",
      title: "Content",
      routeId: "content-route",
      workspaceId: "content-workspace"
    }
  ],
  routes: [
    { id: "layout-route", path: "/layout", workspaceId: "layout-workspace" },
    { id: "content-route", path: "/content", workspaceId: "content-workspace" }
  ],
  workspaces: [
    { id: "layout-workspace" },
    { id: "content-workspace" }
  ],
  navigation: {
    state: "hidden"
  }
});
const shellSidebarWithoutPersistedContent = {
  id: "shell-sidebar",
  x: 1,
  y: 1,
  w: 4,
  h: 10,
  meta: {
    blockType: "sidebar",
    sidebar: {
      state: "fixed"
    }
  }
};
const { items: renderedNavigationItems } = resolveItemsWithSidebarNavigationContent({
  items: [shellSidebarWithoutPersistedContent],
  navigationState
});
const renderedNavigationStrip = resolveMobileIconStripContent(
  renderedNavigationItems[0].meta.sidebar.content,
  { x: 1, y: 1, w: 12, h: 2 },
  { iconStrip: { itemsById: {} } }
);
const operationNavigationItems = resolveSidebarContentOperationItems({
  items: [shellSidebarWithoutPersistedContent],
  sidebarItem: shellSidebarWithoutPersistedContent,
  content: renderedNavigationStrip
});
const navigationStripMove = applySidebarContentItemCommand({
  item: operationNavigationItems[0],
  contentItemId: "sidebar-nav-nav-layout-page",
  patch: { x: 5, y: 1, w: 2, h: 1 },
  geometryTarget: SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP,
  viewportArea: { x: 1, y: 1, w: 12, h: 2 }
});

assert.equal(navigationStripMove.valid, true);
assert.equal(
  navigationStripMove.item.meta.sidebar.content.items.find(
    (contentItem) => contentItem.id === "sidebar-nav-nav-layout-page"
  )?.action.type,
  SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE
);
assert.equal(
  navigationStripMove.item.meta.sidebar.content.items.find(
    (contentItem) => contentItem.id === "sidebar-nav-nav-layout-page"
  )?.action.pageId,
  "layout-page"
);
assert.deepEqual(
  pickContentItemGeometry(
    navigationStripMove.item.meta.sidebar.content.items,
    "sidebar-nav-nav-layout-page"
  ),
  { x: 1, y: 1, w: 1, h: 1 }
);
assert.deepEqual(
  navigationStripMove.item.meta.sidebar.mobileLayout.iconStrip.itemsById["sidebar-nav-nav-layout-page"],
  { x: 5, y: 1, w: 2, h: 1 }
);
assert.deepEqual(
  navigationStripMove.item.meta.sidebar.content.grid,
  { columns: 4, rows: 20 }
);
assert.equal(shellSidebarWithoutPersistedContent.meta.sidebar?.content, undefined);

console.log("sidebar content operation source item tests passed");

function pickContentItemGeometry(items, itemId) {
  const item = items.find((contentItem) => contentItem.id === itemId);

  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}
