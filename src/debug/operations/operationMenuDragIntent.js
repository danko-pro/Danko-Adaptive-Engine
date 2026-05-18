const INTERACTIVE_MENU_TARGET_SELECTOR = "button, input, select, textarea, a, [role='button']";

export function canStartOperationMenuDrag({
  button = 0,
  target,
  hasPosition = false
} = {}) {
  return (
    button === 0 &&
    Boolean(hasPosition) &&
    !isInteractiveOperationMenuTarget(target)
  );
}

export function isInteractiveOperationMenuTarget(target) {
  return Boolean(target?.closest?.(INTERACTIVE_MENU_TARGET_SELECTOR));
}
