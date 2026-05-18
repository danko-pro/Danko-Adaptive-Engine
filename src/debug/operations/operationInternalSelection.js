export const OPERATION_INTERNAL_SELECTION_TYPES = {
  SIDEBAR_CONTENT_ITEM: "sidebar-content-item"
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
