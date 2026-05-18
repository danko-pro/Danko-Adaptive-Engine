import assert from "node:assert/strict";
import {
  SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES,
  resolveSidebarContentNavigationAction
} from "../index.js";
import { SIDEBAR_CONTENT_ACTION_TYPES } from "../../sidebar-element/index.js";

const pages = [
  {
    id: "layout-page",
    routeId: "layout-route",
    workspaceId: "layout-workspace"
  },
  {
    id: "content-page",
    routeId: "content-route",
    workspaceId: "content-workspace"
  }
];
const routes = [
  {
    id: "layout-route",
    workspaceId: "layout-workspace"
  },
  {
    id: "content-route",
    workspaceId: "content-workspace"
  }
];
const workspaces = [
  { id: "layout-workspace" },
  { id: "content-workspace" }
];

assert.deepEqual(
  resolveSidebarContentNavigationAction({
    contentItem: {
      id: "plain-button",
      action: {
        type: SIDEBAR_CONTENT_ACTION_TYPES.NONE
      }
    },
    pages,
    routes,
    workspaces
  }),
  {
    valid: false,
    code: SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES.NO_ACTION,
    pageId: null,
    routeId: null,
    workspaceId: null,
    page: null,
    route: null,
    workspace: null
  }
);

assert.deepEqual(
  resolveSidebarContentNavigationAction({
    contentItem: {
      id: "missing-page",
      action: {
        type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
        pageId: "missing"
      }
    },
    pages,
    routes,
    workspaces
  }),
  {
    valid: false,
    code: SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES.MISSING_PAGE,
    pageId: "missing",
    routeId: null,
    workspaceId: null,
    page: null,
    route: null,
    workspace: null
  }
);

assert.deepEqual(
  resolveSidebarContentNavigationAction({
    contentItem: {
      id: "missing-workspace",
      action: {
        type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
        pageId: "content-page",
        workspaceId: "missing"
      }
    },
    pages,
    routes,
    workspaces
  }),
  {
    valid: false,
    code: SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES.MISSING_WORKSPACE,
    pageId: "content-page",
    routeId: "content-route",
    workspaceId: "missing",
    page: null,
    route: null,
    workspace: null
  }
);

const ready = resolveSidebarContentNavigationAction({
  contentItem: {
    id: "nav-content",
    action: {
      type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
      pageId: "content-page"
    }
  },
  pages,
  routes,
  workspaces
});

assert.equal(ready.valid, true);
assert.equal(ready.code, SIDEBAR_CONTENT_NAVIGATION_ACTION_CODES.READY);
assert.equal(ready.pageId, "content-page");
assert.equal(ready.routeId, "content-route");
assert.equal(ready.workspaceId, "content-workspace");
assert.equal(ready.page.id, "content-page");
assert.equal(ready.route.id, "content-route");
assert.equal(ready.workspace.id, "content-workspace");

const fallbackFromNavigation = resolveSidebarContentNavigationAction({
  contentItem: {
    id: "nav-layout",
    navigation: {
      pageId: "layout-page"
    },
    action: {
      type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE
    }
  },
  pages,
  routes,
  workspaces
});

assert.equal(fallbackFromNavigation.valid, true);
assert.equal(fallbackFromNavigation.pageId, "layout-page");
assert.equal(fallbackFromNavigation.workspaceId, "layout-workspace");

console.log("adapter sidebar content navigation action tests passed");
