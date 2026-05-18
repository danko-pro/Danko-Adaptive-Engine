import assert from "node:assert/strict";
import { NAVIGATION_STATES } from "../../navigation-engine/index.js";
import {
  SIDEBAR_NAVIGATION_CONTENT_DIAGNOSTIC_CODES,
  createNavigationHostState,
  createSidebarContentFromNavigationPlan,
  resolveItemsWithSidebarNavigationContent
} from "../index.js";
import {
  SIDEBAR_CONTENT_ACTION_TYPES,
  SIDEBAR_CONTENT_ITEM_TYPES,
  SIDEBAR_TEXT_FIT_MODES
} from "../../sidebar-element/index.js";

const pages = [
  {
    id: "layout-page",
    title: "Раскладка",
    routeId: "layout-route",
    workspaceId: "layout-workspace"
  },
  {
    id: "content-page",
    title: "Контент",
    routeId: "content-route",
    workspaceId: "content-workspace"
  },
  {
    id: "checks-page",
    title: "Проверки",
    routeId: "checks-route",
    workspaceId: "checks-workspace"
  }
];

const routes = [
  {
    id: "layout-route",
    path: "/layout",
    workspaceId: "layout-workspace"
  },
  {
    id: "content-route",
    path: "/content",
    workspaceId: "content-workspace"
  },
  {
    id: "checks-route",
    path: "/checks",
    workspaceId: "checks-workspace"
  }
];

const workspaces = [
  { id: "layout-workspace" },
  { id: "content-workspace" },
  { id: "checks-workspace" }
];

const navigationState = createNavigationHostState({
  metrics: { columns: 24, rows: 16 },
  activePageId: "content-page",
  pages,
  routes,
  workspaces,
  navigation: {
    state: NAVIGATION_STATES.HIDDEN
  }
});

const contentResult = createSidebarContentFromNavigationPlan({
  navigationState,
  grid: {
    columns: 4,
    rows: 4
  }
});

assert.equal(contentResult.valid, true);
assert.deepEqual(contentResult.diagnostics, []);
assert.deepEqual(contentResult.summary, {
  sourceCount: 3,
  renderedCount: 3,
  skippedCount: 0,
  diagnostics: 0
});
assert.deepEqual(contentResult.content.grid, {
  columns: 4,
  rows: 4
});
assert.equal(contentResult.content.items.length, 3);
assert.deepEqual(contentResult.content.items[0], {
  id: "sidebar-nav-nav-layout-page",
  type: SIDEBAR_CONTENT_ITEM_TYPES.NAVIGATION_ITEM,
  x: 1,
  y: 1,
  w: 4,
  h: 1,
  text: "Раскладка",
  active: false,
  navigation: {
    itemId: "nav-layout-page",
    pageId: "layout-page",
    routeId: "layout-route",
    workspaceId: "layout-workspace"
  },
  action: {
    type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
    pageId: "layout-page",
    routeId: "layout-route",
    workspaceId: "layout-workspace"
  },
  style: {
    fontSize: 14,
    fontWeight: 600,
    align: "center"
  },
  textFit: SIDEBAR_TEXT_FIT_MODES.WRAP
});
assert.equal(contentResult.content.items[1].active, true);
assert.equal(contentResult.content.items[1].action.pageId, "content-page");

const overflowResult = createSidebarContentFromNavigationPlan({
  navigationPlan: navigationState.data.plan,
  grid: {
    columns: 2,
    rows: 1
  }
});

assert.equal(overflowResult.valid, true);
assert.equal(overflowResult.content.items.length, 1);
assert.equal(overflowResult.summary.sourceCount, 3);
assert.equal(overflowResult.summary.renderedCount, 1);
assert.equal(overflowResult.summary.skippedCount, 2);
assert.deepEqual(
  overflowResult.diagnostics.map((diagnostic) => diagnostic.code),
  [
    SIDEBAR_NAVIGATION_CONTENT_DIAGNOSTIC_CODES.GRID_OVERFLOW,
    SIDEBAR_NAVIGATION_CONTENT_DIAGNOSTIC_CODES.GRID_OVERFLOW
  ]
);

const missingProjectionResult = createSidebarContentFromNavigationPlan();

assert.equal(missingProjectionResult.valid, true);
assert.deepEqual(missingProjectionResult.content.items, []);
assert.deepEqual(
  missingProjectionResult.diagnostics.map((diagnostic) => diagnostic.code),
  [SIDEBAR_NAVIGATION_CONTENT_DIAGNOSTIC_CODES.MISSING_PROJECTION]
);

const sourceItems = [
  {
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
  },
  {
    id: "content-block",
    x: 6,
    y: 1,
    w: 4,
    h: 4,
    meta: {
      blockType: "content"
    }
  }
];
const itemsWithSidebarContent = resolveItemsWithSidebarNavigationContent({
  items: sourceItems,
  navigationState
});

assert.equal(itemsWithSidebarContent.items.length, 2);
assert.equal(itemsWithSidebarContent.items[0].id, "shell-sidebar");
assert.equal(itemsWithSidebarContent.items[0].meta.sidebar.content.items.length, 3);
assert.equal(itemsWithSidebarContent.items[0].meta.sidebar.content.items[1].active, true);
assert.equal(itemsWithSidebarContent.items[1], sourceItems[1]);
assert.equal(sourceItems[0].meta.sidebar.content, undefined);

const itemsWithEditedSidebarContent = resolveItemsWithSidebarNavigationContent({
  items: [
    {
      ...sourceItems[0],
      meta: {
        ...sourceItems[0].meta,
        sidebar: {
          ...sourceItems[0].meta.sidebar,
          content: {
            grid: {
              columns: 4,
              rows: 4
            },
            items: [
              {
                id: "sidebar-nav-nav-layout-page",
                x: 1,
                y: 2,
                w: 3,
                h: 1,
                text: "Custom Layout",
                style: {
                  fontSize: 18,
                  fontWeight: 700,
                  align: "left",
                  textColor: "#0f766e",
                  backgroundColor: "#dcfce7",
                  borderColor: "#14532d",
                  borderWidth: 2,
                  textOpacity: 0.7,
                  backgroundOpacity: 0.45
                },
                textFit: SIDEBAR_TEXT_FIT_MODES.TRUNCATE
              }
            ]
          }
        }
      }
    }
  ],
  navigationState
});
const editedNavItem = itemsWithEditedSidebarContent.items[0].meta.sidebar.content.items[0];

assert.equal(editedNavItem.text, "Custom Layout");
assert.deepEqual(editedNavItem.style, {
  fontSize: 18,
  fontWeight: 700,
  align: "left",
  textColor: "#0f766e",
  backgroundColor: "#dcfce7",
  borderColor: "#14532d",
  borderWidth: 2,
  textOpacity: 0.7,
  backgroundOpacity: 0.45
});
assert.equal(editedNavItem.textFit, SIDEBAR_TEXT_FIT_MODES.TRUNCATE);
assert.equal(editedNavItem.action.pageId, "layout-page");
assert.equal(editedNavItem.active, false);
assert.deepEqual({
  x: editedNavItem.x,
  y: editedNavItem.y,
  w: editedNavItem.w,
  h: editedNavItem.h
}, {
  x: 1,
  y: 2,
  w: 3,
  h: 1
});

console.log("adapter navigation sidebar content tests passed");
