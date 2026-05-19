import assert from "node:assert/strict";
import {
  closeAllMobileSidebarMenus,
  closeMobileSidebarMenu,
  createMobileSidebarRuntimeState,
  isMobileSidebarMenuOpen,
  resolveMobileSidebarRuntimeKey,
  setMobileSidebarMenuOpen,
  toggleMobileSidebarMenuOpen
} from "./mobileSidebarRuntimeState.js";
import {
  MOBILE_SIDEBAR_MENU_BUTTON_LABELS,
  resolveMobileSidebarMenuButtonState
} from "./mobileSidebarMenuButtonState.js";
import {
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES,
  isMobileCompactSidebarShell,
  resolveMobileSidebarShellClassName,
  resolveMobileSidebarContentRenderMode
} from "./resolveMobileSidebarContentRenderMode.js";

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

const normalizedState = setMobileSidebarMenuOpen({
  openByKey: {
    "sidebar-a:mobile": true,
    "sidebar-b:mobile": false,
    "sidebar-c:mobile": "true"
  }
}, {
  sidebarItemId: "sidebar-d",
  viewportMode: "mobile",
  open: true
});

assert.deepEqual(normalizedState.openByKey, {
  "sidebar-a:mobile": true,
  "sidebar-d:mobile": true
});

const closedAllState = closeAllMobileSidebarMenus(unknownOpenedState);

assert.notEqual(closedAllState, unknownOpenedState);
assert.deepEqual(closedAllState, {
  openByKey: {}
});

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

console.log("mobile sidebar runtime state tests passed");
