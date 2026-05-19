import assert from "node:assert/strict";
import {
  MOBILE_SIDEBAR_MENU_PANEL_MODES,
  resolveMobileSidebarMenuItemState,
  resolveMobileSidebarMenuPanelState
} from "./mobileSidebarMenuPanelState.js";

const compactRenderInfo = {
  mobilePresentation: {
    mode: "compact-menu-button"
  },
  sidebar: {
    content: {
      items: [
        {
          id: "nav-layout",
          text: "Раскладка",
          active: true,
          variant: "primary"
        },
        {
          id: "nav-checks",
          text: "Проверки",
          disabled: true,
          variant: "danger"
        }
      ]
    }
  }
};

assert.deepEqual(resolveMobileSidebarMenuPanelState({
  open: false,
  renderInfo: compactRenderInfo
}), {
  visible: false,
  mode: MOBILE_SIDEBAR_MENU_PANEL_MODES.HIDDEN,
  items: []
});

assert.deepEqual(resolveMobileSidebarMenuPanelState({
  open: true,
  renderInfo: {
    ...compactRenderInfo,
    mobilePresentation: {
      mode: "icon-strip"
    }
  }
}), {
  visible: false,
  mode: MOBILE_SIDEBAR_MENU_PANEL_MODES.HIDDEN,
  items: []
});

const openPanelState = resolveMobileSidebarMenuPanelState({
  open: true,
  renderInfo: compactRenderInfo
});

assert.equal(openPanelState.visible, true);
assert.equal(openPanelState.mode, MOBILE_SIDEBAR_MENU_PANEL_MODES.COMPACT_MENU);
assert.equal(openPanelState.items.length, 2);

assert.deepEqual(resolveMobileSidebarMenuPanelState({
  open: true,
  renderInfo: {
    mobilePresentation: {
      mode: "compact-menu-button"
    },
    sidebar: {
      content: {
        items: []
      }
    }
  }
}), {
  visible: false,
  mode: MOBILE_SIDEBAR_MENU_PANEL_MODES.HIDDEN,
  items: []
});

const activeItemState = resolveMobileSidebarMenuItemState({
  contentItem: compactRenderInfo.sidebar.content.items[0]
});

assert.equal(activeItemState.id, "nav-layout");
assert.equal(activeItemState.text, "Раскладка");
assert.equal(activeItemState.active, true);
assert.equal(activeItemState.disabled, false);
assert.equal(activeItemState.activatable, true);
assert.equal(
  activeItemState.className,
  "grid-operation-mobile-sidebar-menu-item is-variant-primary is-active"
);

const disabledItemState = resolveMobileSidebarMenuItemState({
  contentItem: compactRenderInfo.sidebar.content.items[1]
});

assert.equal(disabledItemState.disabled, true);
assert.equal(disabledItemState.activatable, false);
assert.equal(
  disabledItemState.className,
  "grid-operation-mobile-sidebar-menu-item is-variant-danger is-disabled"
);

assert.equal(resolveMobileSidebarMenuItemState({ contentItem: {} }).text, "Menu item");

console.log("mobile sidebar menu panel tests passed");
