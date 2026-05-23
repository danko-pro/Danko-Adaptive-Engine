import assert from "node:assert/strict";
import {
  closeAllMobileSidebarMenus,
  closeMobileSidebarMenu,
  createMobileSidebarRuntimeState,
  isMobileSidebarMenuOpen,
  resolveMobileSidebarRuntimeKey,
  setMobileSidebarMenuOpen,
  toggleMobileSidebarMenuOpen
} from "../runtime/mobileSidebarRuntimeState.js";

const initialState = createMobileSidebarRuntimeState();

assert.deepEqual(initialState, {
  openByKey: {}
});
assert.equal(
  isMobileSidebarMenuOpen(initialState, {
    sidebarItemId: "sidebar-a",
    viewportMode: "mobile"
  }),
  false
);

assert.equal(
  resolveMobileSidebarRuntimeKey({
    sidebarItemId: "sidebar-a",
    viewportMode: "mobile"
  }),
  "sidebar-a:mobile"
);
assert.equal(
  resolveMobileSidebarRuntimeKey({
    sidebarItemId: "sidebar-a",
    viewportMode: "narrow"
  }),
  "sidebar-a:narrow"
);
assert.equal(resolveMobileSidebarRuntimeKey({}), "__unknown-sidebar:default");

const openedState = setMobileSidebarMenuOpen(initialState, {
  sidebarItemId: "sidebar-a",
  viewportMode: "mobile",
  open: true
});

assert.notEqual(openedState, initialState);
assert.deepEqual(initialState, {
  openByKey: {}
});
assert.equal(
  isMobileSidebarMenuOpen(openedState, {
    sidebarItemId: "sidebar-a",
    viewportMode: "mobile"
  }),
  true
);

const narrowOpenedState = setMobileSidebarMenuOpen(openedState, {
  sidebarItemId: "sidebar-a",
  viewportMode: "narrow",
  open: true
});

assert.deepEqual(narrowOpenedState.openByKey, {
  "sidebar-a:mobile": true,
  "sidebar-a:narrow": true
});
assert.equal(
  isMobileSidebarMenuOpen(narrowOpenedState, {
    sidebarItemId: "sidebar-a",
    viewportMode: "mobile"
  }),
  true
);
assert.equal(
  isMobileSidebarMenuOpen(narrowOpenedState, {
    sidebarItemId: "sidebar-a",
    viewportMode: "narrow"
  }),
  true
);

const secondSidebarOpenedState = setMobileSidebarMenuOpen(narrowOpenedState, {
  sidebarItemId: "sidebar-b",
  viewportMode: "mobile",
  open: true
});

assert.deepEqual(secondSidebarOpenedState.openByKey, {
  "sidebar-a:mobile": true,
  "sidebar-a:narrow": true,
  "sidebar-b:mobile": true
});

const closedOneState = closeMobileSidebarMenu(secondSidebarOpenedState, {
  sidebarItemId: "sidebar-a",
  viewportMode: "mobile"
});

assert.notEqual(closedOneState, secondSidebarOpenedState);
assert.deepEqual(secondSidebarOpenedState.openByKey, {
  "sidebar-a:mobile": true,
  "sidebar-a:narrow": true,
  "sidebar-b:mobile": true
});
assert.deepEqual(closedOneState.openByKey, {
  "sidebar-a:narrow": true,
  "sidebar-b:mobile": true
});

const toggledClosedState = toggleMobileSidebarMenuOpen(closedOneState, {
  sidebarItemId: "sidebar-a",
  viewportMode: "narrow"
});

assert.equal(
  isMobileSidebarMenuOpen(toggledClosedState, {
    sidebarItemId: "sidebar-a",
    viewportMode: "narrow"
  }),
  false
);

const toggledOpenState = toggleMobileSidebarMenuOpen(toggledClosedState, {
  sidebarItemId: "sidebar-a",
  viewportMode: "narrow"
});

assert.equal(
  isMobileSidebarMenuOpen(toggledOpenState, {
    sidebarItemId: "sidebar-a",
    viewportMode: "narrow"
  }),
  true
);

const unknownOpenedState = setMobileSidebarMenuOpen(toggledOpenState, {
  open: true
});

assert.equal(isMobileSidebarMenuOpen(unknownOpenedState, {}), true);
assert.equal(unknownOpenedState.openByKey["__unknown-sidebar:default"], true);

const normalizedState = setMobileSidebarMenuOpen(
  {
    openByKey: {
      "sidebar-a:mobile": true,
      "sidebar-b:mobile": false,
      "sidebar-c:mobile": "true"
    }
  },
  {
    sidebarItemId: "sidebar-d",
    viewportMode: "mobile",
    open: true
  }
);

assert.deepEqual(normalizedState.openByKey, {
  "sidebar-a:mobile": true,
  "sidebar-d:mobile": true
});

const closedAllState = closeAllMobileSidebarMenus(unknownOpenedState);

assert.notEqual(closedAllState, unknownOpenedState);
assert.deepEqual(closedAllState, {
  openByKey: {}
});

console.log("sidebar-element mobile sidebar runtime state tests passed");
