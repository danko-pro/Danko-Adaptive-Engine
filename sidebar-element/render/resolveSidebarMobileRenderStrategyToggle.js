import {
  SIDEBAR_MOBILE_RENDER_STRATEGIES
} from "../contracts/sidebarElementContract.js";

export const SIDEBAR_MOBILE_RENDER_STRATEGY_TOGGLE_TITLES = {
  compactMenuButton: "Мобильный режим: круглая кнопка меню",
  iconStrip: "Мобильный режим: плашка с иконками сверху"
};

export function resolveSidebarMobileRenderStrategyToggle(settings = {}) {
  const activeStrategy = resolveActiveStrategy(settings?.mobileRenderStrategy);
  const isIconStrip = activeStrategy === SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP;

  return {
    activeStrategy,
    isCompactMenuButton: !isIconStrip,
    isIconStrip,
    nextCompactMenuButton: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON,
    nextIconStrip: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP,
    compactTitle: SIDEBAR_MOBILE_RENDER_STRATEGY_TOGGLE_TITLES.compactMenuButton,
    iconStripTitle: SIDEBAR_MOBILE_RENDER_STRATEGY_TOGGLE_TITLES.iconStrip
  };
}

function resolveActiveStrategy(value) {
  if (value === SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP) {
    return SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP;
  }

  return SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON;
}
