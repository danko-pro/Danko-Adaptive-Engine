export function resolveSidebarContentOperationItems({
  items,
  sidebarItem,
  content
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const resolvedContent = isRecord(content)
    ? content
    : sidebarItem?.meta?.sidebar?.content;

  if (!isRecord(resolvedContent)) {
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
              content: resolvedContent
            }
          }
        }
      : item
  ));
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
