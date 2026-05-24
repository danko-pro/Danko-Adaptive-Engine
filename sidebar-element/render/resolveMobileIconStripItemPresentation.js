import { resolveSidebarContentItemType } from "../contracts/sidebarContent.js";
import { resolveSidebarContentButtonState } from "./resolveSidebarContentButtonState.js";

export function resolveMobileIconStripItemPresentation({ contentItem } = {}) {
  const buttonState = resolveSidebarContentButtonState({ contentItem });
  const text = normalizeItemText(contentItem);

  return {
    id: String(contentItem?.id ?? ""),
    text,
    glyph: resolveItemGlyph(contentItem, text),
    type: resolveSidebarContentItemType(contentItem?.type),
    active: buttonState.active,
    disabled: buttonState.disabled,
    activatable: !buttonState.disabled,
    className: [
      "grid-operation-mobile-sidebar-icon-strip-item",
      `is-type-${normalizeClassValue(buttonState.type)}`,
      buttonState.active ? "is-active" : "",
      buttonState.disabled ? "is-disabled" : ""
    ].filter(Boolean).join(" ")
  };
}

function resolveItemGlyph(contentItem, text) {
  const explicitGlyph = String(contentItem?.glyph ?? contentItem?.icon ?? "").trim();

  if (explicitGlyph) {
    return explicitGlyph.slice(0, 2);
  }

  const firstChar = text.trim().charAt(0);

  return firstChar ? firstChar.toUpperCase() : "•";
}

function normalizeItemText(contentItem) {
  const text = String(contentItem?.text ?? "").trim();

  return text || "Menu";
}

function normalizeClassValue(value) {
  return String(value ?? "").trim().replace(/[^a-zA-Z0-9_-]+/g, "-") || "unknown";
}
