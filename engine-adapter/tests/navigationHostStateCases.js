import assert from "node:assert/strict";
import { NAVIGATION_STATES } from "../../navigation-engine/index.js";
import { createNavigationHostState } from "../index.js";

const pages = [
  {
    id: "workspace-a-page",
    title: "Страница A",
    routeId: "workspace-a-route",
    workspaceId: "workspace-a"
  },
  {
    id: "workspace-b-page",
    title: "Страница B",
    routeId: "workspace-b-route",
    workspaceId: "workspace-b"
  }
];

const routes = [
  {
    id: "workspace-a-route",
    path: "/a",
    workspaceId: "workspace-a"
  },
  {
    id: "workspace-b-route",
    path: "/b",
    workspaceId: "workspace-b"
  }
];

const workspaces = [
  { id: "workspace-a" },
  { id: "workspace-b" }
];

const command = createNavigationHostState({
  metrics: { columns: 80, rows: 30 },
  activePageId: "workspace-b-page",
  pages,
  routes,
  workspaces,
  navigation: {
    state: NAVIGATION_STATES.HIDDEN
  },
  shell: {
    reservedArea: { left: 0, right: 0, top: 0, bottom: 0 }
  }
});

assert.equal(command.ok, true);
assert.equal(command.data.activePageId, "workspace-b-page");
assert.equal(command.data.activeRouteId, "workspace-b-route");
assert.equal(command.data.activeWorkspaceId, "workspace-b");
assert.equal(command.data.plan.valid, true);
assert.equal(command.data.plan.summary.navigationItems, 2);

const fallbackCommand = createNavigationHostState({
  metrics: { columns: 80, rows: 30 },
  activePageId: "missing",
  pages,
  routes,
  workspaces
});

assert.equal(fallbackCommand.ok, true);
assert.equal(fallbackCommand.data.activePageId, "workspace-a-page");

console.log("adapter navigation host state tests passed");
