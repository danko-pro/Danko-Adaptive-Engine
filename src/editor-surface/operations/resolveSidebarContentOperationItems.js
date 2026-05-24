import {
  DEFAULT_SIDEBAR_CONTENT_GRID,
  SIDEBAR_CONTENT_GEOMETRY_TARGETS,
  normalizeSidebarContent
} from "../../../sidebar-element/index.js";

const ICON_STRIP_OPERATION_SEMANTIC_FIELDS = [
  "text",
  "action",
  "type",
  "active",
  "disabled",
  "variant",
  "style",
  "textFit",
  "navigation"
];

const DEFAULT_DESKTOP_CONTENT_ITEM_GEOMETRY = {
  x: 1,
  y: 1,
  w: 1,
  h: 1
};

export function resolveSidebarContentOperationItems({
  items,
  sidebarItem,
  content
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const storedContent = sidebarItem?.meta?.sidebar?.content;
  const resolvedContent = resolveOperationSidebarContent({
    content,
    storedContent
  });

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

export function resolveIconStripOperationContent({
  storedContent,
  renderedContent
} = {}) {
  const stored = normalizeSidebarContent(isRecord(storedContent) ? storedContent : {});
  const rendered = normalizeSidebarContent(isRecord(renderedContent) ? renderedContent : {});
  const storedItemsById = new Map(
    stored.items.map((contentItem) => [String(contentItem.id), contentItem])
  );
  const renderedIds = new Set(rendered.items.map((contentItem) => String(contentItem.id)));

  const mergedItems = rendered.items.map((renderedItem) => {
    const storedItem = storedItemsById.get(String(renderedItem.id));
    const semantic = pickIconStripOperationSemanticFields(renderedItem);

    if (storedItem) {
      return {
        ...storedItem,
        ...semantic,
        id: storedItem.id,
        x: storedItem.x,
        y: storedItem.y,
        w: storedItem.w,
        h: storedItem.h
      };
    }

    return {
      ...semantic,
      id: renderedItem.id,
      ...DEFAULT_DESKTOP_CONTENT_ITEM_GEOMETRY
    };
  });

  for (const storedItem of stored.items) {
    if (!renderedIds.has(String(storedItem.id))) {
      mergedItems.push(storedItem);
    }
  }

  return normalizeSidebarContent({
    grid: resolveIconStripOperationGrid(stored, renderedContent),
    items: mergedItems
  });
}

function resolveOperationSidebarContent({ content, storedContent }) {
  if (!isRecord(content)) {
    return storedContent ?? null;
  }

  if (content.geometryTarget === SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP) {
    return resolveIconStripOperationContent({
      storedContent,
      renderedContent: content
    });
  }

  return content;
}

function resolveIconStripOperationGrid(storedContent, renderedContent) {
  if (hasContentGrid(storedContent)) {
    return storedContent.grid;
  }

  if (
    isRecord(renderedContent) &&
    renderedContent.geometryTarget !== SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP &&
    hasContentGrid(renderedContent)
  ) {
    return renderedContent.grid;
  }

  return DEFAULT_SIDEBAR_CONTENT_GRID;
}

function pickIconStripOperationSemanticFields(contentItem) {
  return ICON_STRIP_OPERATION_SEMANTIC_FIELDS.reduce((result, field) => {
    if (contentItem[field] !== undefined) {
      result[field] = contentItem[field];
    }

    return result;
  }, {});
}

function hasContentGrid(content) {
  return isRecord(content?.grid);
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
