export const OPERATION_INTERNAL_SELECTION_TYPES = {
  SIDEBAR_CONTENT_ITEM: "sidebar-content-item",
  MOBILE_SIDEBAR_BUTTON: "mobile-sidebar-button"
};

export function createSidebarContentItemSelection({
  sidebarItem = null,
  sidebarItemId = null,
  contentItem = null,
  contentItemId = null
} = {}) {
  const resolvedSidebarItemId = normalizeOptionalId(sidebarItemId ?? sidebarItem?.id);
  const resolvedContentItemId = normalizeOptionalId(contentItemId ?? contentItem?.id);

  if (!resolvedSidebarItemId || !resolvedContentItemId) {
    return null;
  }

  return {
    type: OPERATION_INTERNAL_SELECTION_TYPES.SIDEBAR_CONTENT_ITEM,
    sidebarItemId: resolvedSidebarItemId,
    contentItemId: resolvedContentItemId,
    sidebarItem,
    contentItem
  };
}

export function isSidebarContentItemSelection(selection) {
  return selection?.type === OPERATION_INTERNAL_SELECTION_TYPES.SIDEBAR_CONTENT_ITEM;
}

export function createMobileSidebarButtonSelection({
  sidebarItem = null,
  sidebarItemId = null
} = {}) {
  const resolvedSidebarItemId = normalizeOptionalId(sidebarItemId ?? sidebarItem?.id);

  if (!resolvedSidebarItemId) {
    return null;
  }

  return {
    type: OPERATION_INTERNAL_SELECTION_TYPES.MOBILE_SIDEBAR_BUTTON,
    sidebarItemId: resolvedSidebarItemId,
    sidebarItem
  };
}

export function isMobileSidebarButtonSelection(selection) {
  return selection?.type === OPERATION_INTERNAL_SELECTION_TYPES.MOBILE_SIDEBAR_BUTTON;
}

export function isSelectedMobileSidebarButton(selection, {
  sidebarItem = null,
  sidebarItemId = null
} = {}) {
  if (!isMobileSidebarButtonSelection(selection)) {
    return false;
  }

  const resolvedSidebarItemId = normalizeOptionalId(sidebarItemId ?? sidebarItem?.id);

  return selection.sidebarItemId === resolvedSidebarItemId;
}

export function isSelectedSidebarContentItem(selection, {
  sidebarItem = null,
  sidebarItemId = null,
  contentItem = null,
  contentItemId = null
} = {}) {
  if (!isSidebarContentItemSelection(selection)) {
    return false;
  }

  const resolvedSidebarItemId = normalizeOptionalId(sidebarItemId ?? sidebarItem?.id);
  const resolvedContentItemId = normalizeOptionalId(contentItemId ?? contentItem?.id);

  return (
    selection.sidebarItemId === resolvedSidebarItemId &&
    selection.contentItemId === resolvedContentItemId
  );
}

export function formatSidebarContentItemSelection(selection) {
  if (!isSidebarContentItemSelection(selection)) {
    return "";
  }

  const label = normalizeLabel(selection.contentItem?.text, selection.contentItemId);

  return [
    `sidebar ${selection.sidebarItemId}`,
    `кнопка ${label}`,
    label !== selection.contentItemId ? `id: ${selection.contentItemId}` : ""
  ].filter(Boolean).join(" · ");
}

export function formatMobileSidebarButtonSelection(selection) {
  if (!isMobileSidebarButtonSelection(selection)) {
    return "";
  }

  return [
    `sidebar ${selection.sidebarItemId}`,
    "mobile menu button"
  ].join(" · ");
}

function normalizeLabel(value, fallback) {
  const text = value === undefined || value === null ? "" : String(value).trim();

  return text || fallback;
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
