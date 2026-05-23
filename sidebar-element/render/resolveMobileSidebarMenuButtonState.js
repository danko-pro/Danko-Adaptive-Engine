export const MOBILE_SIDEBAR_MENU_BUTTON_LABELS = {
  CLOSED: "Открыть мобильное меню",
  OPEN: "Закрыть мобильное меню"
};

export function resolveMobileSidebarMenuButtonState({
  presentation,
  open = false
} = {}) {
  const visible = Boolean(
    presentation?.mode === "compact-menu-button" && isAreaLike(presentation.buttonArea)
  );
  const isOpen = Boolean(open);

  return {
    visible,
    label: isOpen
      ? MOBILE_SIDEBAR_MENU_BUTTON_LABELS.OPEN
      : MOBILE_SIDEBAR_MENU_BUTTON_LABELS.CLOSED,
    glyph: isOpen ? "×" : "☰",
    className: [
      "grid-operation-mobile-sidebar-menu-button",
      isOpen ? "is-open" : ""
    ].filter(Boolean).join(" ")
  };
}

function isAreaLike(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Number.isFinite(Number(value.x)) &&
    Number.isFinite(Number(value.y)) &&
    Number.isFinite(Number(value.w)) &&
    Number.isFinite(Number(value.h))
  );
}
