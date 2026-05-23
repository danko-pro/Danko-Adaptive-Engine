import { resolveSidebarContentButtonState } from "./resolveSidebarContentButtonState.js";

export const MOBILE_SIDEBAR_MENU_PANEL_MODES = {
  HIDDEN: "hidden",
  COMPACT_MENU: "compact-menu"
};

export function resolveMobileSidebarMenuPanelState({
  open = false,
  renderInfo
} = {}) {
  const items = Array.isArray(renderInfo?.sidebar?.content?.items)
    ? renderInfo.sidebar.content.items
    : [];
  const visible = Boolean(
    open === true &&
    renderInfo?.mobilePresentation?.mode === "compact-menu-button" &&
    items.length > 0
  );

  return {
    visible,
    mode: visible
      ? MOBILE_SIDEBAR_MENU_PANEL_MODES.COMPACT_MENU
      : MOBILE_SIDEBAR_MENU_PANEL_MODES.HIDDEN,
    items: visible ? items : []
  };
}

export function resolveMobileSidebarMenuItemState({ contentItem } = {}) {
  const buttonState = resolveSidebarContentButtonState({ contentItem });

  return {
    id: String(contentItem?.id ?? ""),
    text: normalizeItemText(contentItem),
    active: buttonState.active,
    disabled: buttonState.disabled,
    variant: buttonState.variant,
    activatable: !buttonState.disabled,
    className: [
      "grid-operation-mobile-sidebar-menu-item",
      `is-variant-${normalizeClassValue(buttonState.variant)}`,
      buttonState.active ? "is-active" : "",
      buttonState.disabled ? "is-disabled" : ""
    ].filter(Boolean).join(" ")
  };
}

function normalizeItemText(contentItem) {
  const text = String(contentItem?.text ?? "").trim();

  return text || "Menu item";
}

function normalizeClassValue(value) {
  return String(value ?? "").trim().replace(/[^a-zA-Z0-9_-]+/g, "-") || "unknown";
}
