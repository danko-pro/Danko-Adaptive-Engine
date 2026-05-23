import { SIDEBAR_TEXT_FIT_MODES } from "../contracts/sidebarContent.js";
import { resolveSidebarContentButtonState } from "./resolveSidebarContentButtonState.js";

export function getSidebarContentItemClassName(item, { selected = false, buttonState = null } = {}) {
  const resolvedButtonState = buttonState ?? resolveSidebarContentButtonState({
    contentItem: item,
    selected,
    hovered: false,
    pressed: false
  });

  return dedupeClassParts([
    "grid-operation-sidebar-content-item",
    `is-type-${normalizeClassValue(item?.type)}`,
    `is-text-fit-${normalizeClassValue(item?.textFit ?? SIDEBAR_TEXT_FIT_MODES.WRAP)}`,
    item?.active ? "is-active" : "",
    selected ? "is-selected" : "",
    ...resolvedButtonState.classParts
  ]).join(" ");
}

function dedupeClassParts(parts) {
  return Array.from(new Set(parts.filter(Boolean)));
}

function normalizeClassValue(value) {
  return String(value || "unknown").trim().replaceAll(" ", "-") || "unknown";
}
