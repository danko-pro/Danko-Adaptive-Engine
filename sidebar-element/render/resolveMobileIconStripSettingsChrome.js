export const MOBILE_ICON_STRIP_SETTINGS_LABEL = "Настройки сайдбара";

export function resolveMobileIconStripSettingsChrome() {
  return {
    glyph: "⚙",
    label: MOBILE_ICON_STRIP_SETTINGS_LABEL,
    className: "grid-operation-mobile-sidebar-icon-strip-settings"
  };
}
