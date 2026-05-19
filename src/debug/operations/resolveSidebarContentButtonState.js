import {
  SIDEBAR_CONTENT_ACTION_TYPES,
  SIDEBAR_CONTENT_ITEM_TYPES,
  resolveSidebarContentItemType
} from "../../../sidebar-element/index.js";

export const SIDEBAR_CONTENT_BUTTON_VARIANTS = {
  DEFAULT: "default",
  PRIMARY: "primary",
  SECONDARY: "secondary",
  GHOST: "ghost",
  DANGER: "danger"
};

const KNOWN_BUTTON_VARIANTS = new Set(Object.values(SIDEBAR_CONTENT_BUTTON_VARIANTS));

export function resolveSidebarContentButtonState({
  contentItem = {},
  selected = false,
  pressed = false,
  hovered = false
} = {}) {
  const type = resolveSidebarContentItemType(contentItem?.type, SIDEBAR_CONTENT_ITEM_TYPES.BUTTON);
  const variant = normalizeVariant(contentItem?.variant);
  const actionType = normalizeActionType(contentItem?.action?.type);
  const state = {
    type,
    variant,
    active: Boolean(contentItem?.active),
    disabled: Boolean(contentItem?.disabled),
    selected: Boolean(selected),
    hovered: Boolean(hovered),
    pressed: Boolean(pressed),
    actionType
  };
  const classParts = resolveSidebarContentButtonClassParts(state);

  return {
    ...state,
    classParts,
    className: classParts.join(" ")
  };
}

export function shouldAllowSidebarContentItemPointerAction(buttonState) {
  return !Boolean(buttonState?.disabled);
}

export function shouldAllowSidebarContentItemActivation(buttonState) {
  return !Boolean(buttonState?.disabled);
}

export function shouldAllowSidebarContentItemMenuOpen() {
  return true;
}

export function resolveSidebarContentItemTabIndex(buttonState, selected = false) {
  if (buttonState?.disabled) {
    return -1;
  }

  return 0;
}

export function resolveSidebarContentItemAriaDisabled(buttonState) {
  return buttonState?.disabled ? true : undefined;
}

function resolveSidebarContentButtonClassParts(state) {
  return [
    "grid-operation-sidebar-content-button",
    `is-type-${normalizeClassValue(state.type)}`,
    `is-variant-${normalizeClassValue(state.variant)}`,
    `is-action-${normalizeClassValue(state.actionType)}`,
    state.active ? "is-active" : "",
    state.disabled ? "is-disabled" : "",
    state.selected ? "is-selected" : "",
    state.hovered ? "is-hovered" : "",
    state.pressed ? "is-pressed" : ""
  ].filter(Boolean);
}

function normalizeVariant(value) {
  const text = normalizeText(value);

  return KNOWN_BUTTON_VARIANTS.has(text) ? text : SIDEBAR_CONTENT_BUTTON_VARIANTS.DEFAULT;
}

function normalizeActionType(value) {
  const text = normalizeText(value);

  return text || SIDEBAR_CONTENT_ACTION_TYPES.NONE;
}

function normalizeClassValue(value) {
  return normalizeText(value).replace(/[^a-zA-Z0-9_-]+/g, "-") || "unknown";
}

function normalizeText(value) {
  return String(value ?? "").trim();
}
