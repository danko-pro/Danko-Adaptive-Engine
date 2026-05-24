import assert from "node:assert/strict";
import {
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  resolveSidebarMobileRenderStrategyToggle
} from "../index.js";

assert.deepEqual(
  resolveSidebarMobileRenderStrategyToggle({
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
  }),
  {
    activeStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
    isCompactMenuButton: true,
    isIconStrip: false,
    nextCompactMenuButton: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
    nextIconStrip: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    compactTitle: "Мобильный режим: круглая кнопка меню",
    iconStripTitle: "Мобильный режим: плашка с иконками сверху",
    compactClassName: "grid-operation-sidebar-mobile-strategy-button is-strategy-compact-menu-button is-active",
    iconStripClassName: "grid-operation-sidebar-mobile-strategy-button is-strategy-icon-strip",
    scopeLabel: "mobile/narrow only"
  }
);

assert.deepEqual(
  resolveSidebarMobileRenderStrategyToggle({
    mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP
  }),
  {
    activeStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    isCompactMenuButton: false,
    isIconStrip: true,
    nextCompactMenuButton: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
    nextIconStrip: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    compactTitle: "Мобильный режим: круглая кнопка меню",
    iconStripTitle: "Мобильный режим: плашка с иконками сверху",
    compactClassName: "grid-operation-sidebar-mobile-strategy-button is-strategy-compact-menu-button",
    iconStripClassName: "grid-operation-sidebar-mobile-strategy-button is-strategy-icon-strip is-active",
    scopeLabel: "mobile/narrow only"
  }
);

assert.equal(
  resolveSidebarMobileRenderStrategyToggle({
    mobileRenderStrategy: "unknown"
  }).activeStrategy,
  SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
);

console.log("mobile sidebar render strategy toggle tests passed");
