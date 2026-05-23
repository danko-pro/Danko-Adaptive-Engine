const SIDEBAR_CONTENT_ACTIVATION_KEYS = new Set(["Enter", " "]);

export function stopSidebarContentBoundaryEvent(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
}

export function shouldActivateSidebarContentByPointer(event) {
  return Number(event?.button ?? 0) === 0;
}

export function shouldActivateSidebarContentByKeyboard(event) {
  return SIDEBAR_CONTENT_ACTIVATION_KEYS.has(event?.key);
}

export function handleSidebarContentPointerBoundary({
  event,
  sidebarItem,
  contentItem,
  onSelectItem
} = {}) {
  stopSidebarContentBoundaryEvent(event);

  if (!shouldActivateSidebarContentByPointer(event)) {
    return false;
  }

  onSelectItem?.(event, sidebarItem, contentItem);
  return true;
}

export function handleSidebarContentKeyboardBoundary({
  event,
  sidebarItem,
  contentItem,
  onSelectItem
} = {}) {
  if (!shouldActivateSidebarContentByKeyboard(event)) {
    return false;
  }

  stopSidebarContentBoundaryEvent(event);
  onSelectItem?.(event, sidebarItem, contentItem);
  return true;
}
