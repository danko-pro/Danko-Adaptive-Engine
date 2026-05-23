import assert from "node:assert/strict";
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

console.log("mobile sidebar presentation tests passed");
