const DEFAULT_MENU_MARGIN = 8;
const DEFAULT_MENU_GAP = 8;

export function resolveOperationMenuPosition({
  anchor,
  menuSize,
  viewportRect,
  workspaceRect,
  margin = DEFAULT_MENU_MARGIN,
  gap = DEFAULT_MENU_GAP
} = {}) {
  const bounds = resolveOperationMenuBounds({ viewportRect, workspaceRect, margin });
  const size = normalizeSize(menuSize);
  const normalizedAnchor = normalizeAnchor(anchor);
  const preferredLeft = normalizedAnchor.centerX - size.width / 2;
  const preferredTop = normalizedAnchor.top - size.height - gap;
  const fallbackTop = normalizedAnchor.bottom + gap;

  return clampMenuPosition({
    position: {
      left: preferredLeft,
      top: preferredTop >= bounds.top ? preferredTop : fallbackTop
    },
    menuSize: size,
    bounds
  });
}

export function resolveDraggedOperationMenuPosition({
  position,
  delta,
  menuSize,
  viewportRect,
  workspaceRect,
  margin = DEFAULT_MENU_MARGIN
} = {}) {
  const bounds = resolveOperationMenuBounds({ viewportRect, workspaceRect, margin });
  const size = normalizeSize(menuSize);
  const sourcePosition = normalizePosition(position);
  const sourceDelta = normalizeDelta(delta);

  return clampMenuPosition({
    position: {
      left: sourcePosition.left + sourceDelta.x,
      top: sourcePosition.top + sourceDelta.y
    },
    menuSize: size,
    bounds
  });
}

export function resolveOperationMenuBounds({
  viewportRect,
  workspaceRect,
  margin = DEFAULT_MENU_MARGIN
} = {}) {
  const viewport = normalizeRect(viewportRect);
  const workspace = normalizeRect(workspaceRect) ?? viewport;
  const intersected = {
    left: Math.max(viewport.left, workspace.left),
    top: Math.max(viewport.top, workspace.top),
    right: Math.min(viewport.right, workspace.right),
    bottom: Math.min(viewport.bottom, workspace.bottom)
  };
  const source = isUsableRect(intersected) ? intersected : viewport;

  return {
    left: source.left + margin,
    top: source.top + margin,
    right: source.right - margin,
    bottom: source.bottom - margin
  };
}

function clampMenuPosition({ position, menuSize, bounds }) {
  const maxLeft = Math.max(bounds.left, bounds.right - menuSize.width);
  const maxTop = Math.max(bounds.top, bounds.bottom - menuSize.height);

  return {
    left: clamp(position.left, bounds.left, maxLeft),
    top: clamp(position.top, bounds.top, maxTop)
  };
}

function normalizeAnchor(anchor) {
  return {
    centerX: normalizeNumber(anchor?.centerX, 0),
    top: normalizeNumber(anchor?.top, 0),
    bottom: normalizeNumber(anchor?.bottom, 0)
  };
}

function normalizePosition(position) {
  return {
    left: normalizeNumber(position?.left, 0),
    top: normalizeNumber(position?.top, 0)
  };
}

function normalizeDelta(delta) {
  return {
    x: normalizeNumber(delta?.x, 0),
    y: normalizeNumber(delta?.y, 0)
  };
}

function normalizeSize(size) {
  return {
    width: Math.max(0, normalizeNumber(size?.width, 0)),
    height: Math.max(0, normalizeNumber(size?.height, 0))
  };
}

function normalizeRect(rect) {
  const left = normalizeNumber(rect?.left, 0);
  const top = normalizeNumber(rect?.top, 0);
  const right = normalizeNumber(rect?.right, left + normalizeNumber(rect?.width, 0));
  const bottom = normalizeNumber(rect?.bottom, top + normalizeNumber(rect?.height, 0));
  const normalized = { left, top, right, bottom };

  return isUsableRect(normalized) ? normalized : null;
}

function isUsableRect(rect) {
  return (
    rect &&
    Number.isFinite(rect.left) &&
    Number.isFinite(rect.top) &&
    Number.isFinite(rect.right) &&
    Number.isFinite(rect.bottom) &&
    rect.right > rect.left &&
    rect.bottom > rect.top
  );
}

function normalizeNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}
