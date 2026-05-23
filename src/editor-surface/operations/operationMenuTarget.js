export const OPERATION_MENU_TARGET_TYPES = {
  AREA_ITEM: "area-item",
  SIDEBAR_CONTENT_ITEM: "sidebar-content-item",
  MOBILE_SIDEBAR_BUTTON: "mobile-sidebar-button"
};

export function createAreaOperationMenuTarget(itemOrId) {
  const itemId = normalizeOptionalId(isRecord(itemOrId) ? itemOrId.id : itemOrId);

  if (!itemId) {
    return null;
  }

  return {
    type: OPERATION_MENU_TARGET_TYPES.AREA_ITEM,
    itemId
  };
}

export function createSidebarContentOperationMenuTarget({
  sidebarItemId,
  contentItemId
} = {}) {
  const resolvedSidebarItemId = normalizeOptionalId(sidebarItemId);
  const resolvedContentItemId = normalizeOptionalId(contentItemId);

  if (!resolvedSidebarItemId || !resolvedContentItemId) {
    return null;
  }

  return {
    type: OPERATION_MENU_TARGET_TYPES.SIDEBAR_CONTENT_ITEM,
    sidebarItemId: resolvedSidebarItemId,
    contentItemId: resolvedContentItemId
  };
}

export function createMobileSidebarButtonOperationMenuTarget({
  sidebarItemId
} = {}) {
  const resolvedSidebarItemId = normalizeOptionalId(sidebarItemId);

  if (!resolvedSidebarItemId) {
    return null;
  }

  return {
    type: OPERATION_MENU_TARGET_TYPES.MOBILE_SIDEBAR_BUTTON,
    sidebarItemId: resolvedSidebarItemId
  };
}

export function resolveOperationMenuTarget(value) {
  if (!value) {
    return null;
  }

  if (!isRecord(value)) {
    return createAreaOperationMenuTarget(value);
  }

  if (value.type === OPERATION_MENU_TARGET_TYPES.SIDEBAR_CONTENT_ITEM) {
    return createSidebarContentOperationMenuTarget(value);
  }

  if (value.type === OPERATION_MENU_TARGET_TYPES.MOBILE_SIDEBAR_BUTTON) {
    return createMobileSidebarButtonOperationMenuTarget(value);
  }

  return createAreaOperationMenuTarget(value.itemId ?? value.id);
}

export function getOperationMenuTargetAnchorItemId(value) {
  const target = resolveOperationMenuTarget(value);

  if (!target) {
    return null;
  }

  if (target.type === OPERATION_MENU_TARGET_TYPES.SIDEBAR_CONTENT_ITEM) {
    return target.sidebarItemId;
  }

  if (target.type === OPERATION_MENU_TARGET_TYPES.MOBILE_SIDEBAR_BUTTON) {
    return target.sidebarItemId;
  }

  return target.itemId;
}

export function getOperationMenuTargetAnchorKey(value) {
  const target = resolveOperationMenuTarget(value);

  if (!target) {
    return "";
  }

  if (target.type === OPERATION_MENU_TARGET_TYPES.SIDEBAR_CONTENT_ITEM) {
    return getOperationMenuTargetKey(target);
  }

  if (target.type === OPERATION_MENU_TARGET_TYPES.MOBILE_SIDEBAR_BUTTON) {
    return getOperationMenuTargetKey(target);
  }

  return target.itemId;
}

export function getOperationMenuTargetKey(value) {
  const target = resolveOperationMenuTarget(value);

  if (!target) {
    return "";
  }

  if (target.type === OPERATION_MENU_TARGET_TYPES.SIDEBAR_CONTENT_ITEM) {
    return `${target.type}:${target.sidebarItemId}:${target.contentItemId}`;
  }

  if (target.type === OPERATION_MENU_TARGET_TYPES.MOBILE_SIDEBAR_BUTTON) {
    return `${target.type}:${target.sidebarItemId}`;
  }

  return `${target.type}:${target.itemId}`;
}

export function resolveOperationMenuTargetItem({ target, items = [] } = {}) {
  const anchorItemId = getOperationMenuTargetAnchorItemId(target);

  if (!anchorItemId || !Array.isArray(items)) {
    return null;
  }

  return items.find((item) => String(item?.id ?? "") === anchorItemId) ?? null;
}

export function isAreaOperationMenuTargetForItem(target, item) {
  const resolvedTarget = resolveOperationMenuTarget(target);

  return (
    resolvedTarget?.type === OPERATION_MENU_TARGET_TYPES.AREA_ITEM &&
    String(resolvedTarget.itemId) === String(item?.id ?? "")
  );
}

export function isSidebarContentOperationMenuTarget(target) {
  return resolveOperationMenuTarget(target)?.type === OPERATION_MENU_TARGET_TYPES.SIDEBAR_CONTENT_ITEM;
}

export function isMobileSidebarButtonOperationMenuTarget(target) {
  return resolveOperationMenuTarget(target)?.type === OPERATION_MENU_TARGET_TYPES.MOBILE_SIDEBAR_BUTTON;
}

export function resolveSidebarContentOperationMenuTargetItem({ target, item } = {}) {
  const resolvedTarget = resolveOperationMenuTarget(target);

  if (resolvedTarget?.type !== OPERATION_MENU_TARGET_TYPES.SIDEBAR_CONTENT_ITEM) {
    return null;
  }

  const contentItems = Array.isArray(item?.meta?.sidebar?.content?.items)
    ? item.meta.sidebar.content.items
    : [];

  return contentItems.find((contentItem) => (
    String(contentItem?.id ?? "") === resolvedTarget.contentItemId
  )) ?? null;
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
