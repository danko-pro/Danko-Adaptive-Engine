import assert from "node:assert/strict";
import { createNavigationPageCommand } from "../index.js";

const command = createNavigationPageCommand({
  pages: [
    { id: "layout-page", title: "Layout", routeId: "layout-route", workspaceId: "layout-workspace" },
    { id: "content-page", title: "Content", routeId: "content-route", workspaceId: "content-workspace" }
  ],
  routes: [
    { id: "layout-route", path: "/layout", workspaceId: "layout-workspace" },
    { id: "content-route", path: "/content", workspaceId: "content-workspace" }
  ],
  workspaces: [
    { id: "layout-workspace" },
    { id: "content-workspace" }
  ]
});

assert.equal(command.valid, true);
assert.equal(command.changed, true);
assert.equal(command.pages.length, 3);
assert.equal(command.routes.length, 3);
assert.equal(command.workspaces.length, 3);
assert.deepEqual(command.page, {
  id: "page-3-page",
  title: "Page 3",
  routeId: "route-3-route",
  workspaceId: "workspace-3-workspace"
});
assert.deepEqual(command.route, {
  id: "route-3-route",
  path: "/page-3-page",
  workspaceId: "workspace-3-workspace"
});
assert.deepEqual(command.workspace, {
  id: "workspace-3-workspace"
});
assert.equal(command.activePageId, command.page.id);
assert.equal(command.activeWorkspaceId, command.workspace.id);

const collisionCommand = createNavigationPageCommand({
  pages: [
    ...command.pages,
    { id: "page-4-page", title: "Existing" }
  ],
  routes: [
    ...command.routes,
    { id: "route-4-route", path: "/existing", workspaceId: "workspace-4-workspace" }
  ],
  workspaces: [
    ...command.workspaces,
    { id: "workspace-4-workspace" }
  ],
  title: "Custom"
});

assert.equal(collisionCommand.page.id, "page-5-page");
assert.equal(collisionCommand.page.title, "Custom");
assert.equal(collisionCommand.route.id, "route-5-route");
assert.equal(collisionCommand.workspace.id, "workspace-5-workspace");

console.log("navigation page command tests passed");
