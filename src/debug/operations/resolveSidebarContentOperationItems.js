export function resolveSidebarContentOperationItems({
  items,
  sidebarItem
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];

  if (!isRecord(sidebarItem?.meta?.sidebar?.content)) {
    return sourceItems;
  }

  return sourceItems.map((item) => (
    String(item?.id ?? "") === String(sidebarItem?.id ?? "")
      ? {
          ...item,
          meta: {
            ...(isRecord(item?.meta) ? item.meta : {}),
            blockType: item?.meta?.blockType ?? sidebarItem?.meta?.blockType,
            sidebar: {
              ...(isRecord(item?.meta?.sidebar) ? item.meta.sidebar : {}),
              content: sidebarItem.meta.sidebar.content
            }
          }
        }
      : item
  ));
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
