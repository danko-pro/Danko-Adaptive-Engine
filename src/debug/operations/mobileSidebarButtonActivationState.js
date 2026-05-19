export const MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS = {
  NONE: "none",
  SCHEDULE_TOGGLE: "schedule-toggle",
  CANCEL_PENDING: "cancel-pending",
  OPEN_MENU: "open-menu"
};

export function resolveMobileSidebarButtonClickAction({
  pointerPress
} = {}) {
  return pointerPress?.dragged === true
    ? MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS.NONE
    : MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS.SCHEDULE_TOGGLE;
}

export function resolveMobileSidebarButtonDoubleClickAction() {
  return {
    cancelPending: true,
    action: MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS.OPEN_MENU
  };
}

export function resolveMobileSidebarButtonPointerMoveState({
  pointerPress,
  clientX,
  clientY,
  tolerancePx
} = {}) {
  if (!pointerPress) {
    return null;
  }

  const dragged = Boolean(pointerPress.dragged) ||
    Math.abs(Number(clientX) - Number(pointerPress.clientX)) > Number(tolerancePx) ||
    Math.abs(Number(clientY) - Number(pointerPress.clientY)) > Number(tolerancePx);

  return {
    ...pointerPress,
    dragged
  };
}
