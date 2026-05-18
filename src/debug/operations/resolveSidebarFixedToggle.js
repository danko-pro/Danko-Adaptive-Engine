import { SIDEBAR_STATES } from "../../../sidebar-element/index.js";

export const SIDEBAR_FIXED_TOGGLE_TITLES = {
  active: "Отключить фиксацию: сайдбар станет поверхностным и перестанет резервировать зону",
  inactive: "Включить фиксацию: сайдбар зарезервирует свою зону и не пустит layout-блоки под себя"
};

export function resolveSidebarFixedToggle(settings = {}) {
  const state = String(settings?.state ?? SIDEBAR_STATES.OVERLAY).trim();
  const active = state === SIDEBAR_STATES.FIXED;

  return {
    active,
    nextState: active ? SIDEBAR_STATES.OVERLAY : SIDEBAR_STATES.FIXED,
    title: active ? SIDEBAR_FIXED_TOGGLE_TITLES.active : SIDEBAR_FIXED_TOGGLE_TITLES.inactive
  };
}
