import {
  DEFAULT_SIDEBAR_CONTENT_GRID,
  SIDEBAR_CONTENT_ACTION_TYPES,
  SIDEBAR_CONTENT_ITEM_TYPES,
  SIDEBAR_TEXT_FIT_MODES,
  normalizeSidebarContent,
  normalizeSidebarContentGrid
} from "../../sidebar-element/index.js";

export const SIDEBAR_NAVIGATION_CONTENT_DIAGNOSTIC_CODES = {
  MISSING_PROJECTION: "sidebar-navigation-projection-missing",
  GRID_OVERFLOW: "sidebar-navigation-content-grid-overflow"
};

export function createSidebarContentFromNavigationPlan({
  navigationPlan = null,
  navigationState = null,
  grid = DEFAULT_SIDEBAR_CONTENT_GRID,
  activePageId = null,
  startX = 1,
  startY = 1,
  itemHeight = 1,
  rowGap = 0
} = {}) {
  const plan = resolveNavigationPlanInput(navigationPlan ?? navigationState);
  const projections = resolveNavigationProjections(plan);
  const normalizedGrid = normalizeSidebarContentGrid(grid);
  const diagnostics = [];

  if (!projections) {
    diagnostics.push(createDiagnostic({
      code: SIDEBAR_NAVIGATION_CONTENT_DIAGNOSTIC_CODES.MISSING_PROJECTION,
      message: "Navigation projection is missing."
    }));

    return createResult({
      content: normalizeSidebarContent({
        grid: normalizedGrid,
        items: []
      }),
      diagnostics,
      sourceCount: 0,
      renderedCount: 0
    });
  }

  const resolvedActivePageId = normalizeOptionalId(activePageId) ?? normalizeOptionalId(plan?.active?.pageId);
  const items = [];
  const safeStartX = clampGridPosition(startX, 1, normalizedGrid.columns);
  const safeStartY = clampGridPosition(startY, 1, normalizedGrid.rows);
  const safeItemHeight = Math.max(1, Math.round(Number(itemHeight) || 1));
  const safeRowGap = Math.max(0, Math.round(Number(rowGap) || 0));
  const maxWidth = normalizedGrid.columns - safeStartX + 1;

  for (let index = 0; index < projections.length; index += 1) {
    const projection = projections[index];
    const y = safeStartY + index * (safeItemHeight + safeRowGap);

    if (y + safeItemHeight - 1 > normalizedGrid.rows) {
      diagnostics.push(createDiagnostic({
        code: SIDEBAR_NAVIGATION_CONTENT_DIAGNOSTIC_CODES.GRID_OVERFLOW,
        message: "Navigation item does not fit sidebar content grid.",
        itemId: normalizeOptionalId(projection?.itemId),
        details: {
          index,
          y,
          itemHeight: safeItemHeight,
          gridRows: normalizedGrid.rows
        }
      }));
      continue;
    }

    items.push(createSidebarNavigationContentItem({
      projection,
      index,
      x: safeStartX,
      y,
      w: maxWidth,
      h: safeItemHeight,
      activePageId: resolvedActivePageId
    }));
  }

  return createResult({
    content: normalizeSidebarContent({
      grid: normalizedGrid,
      items
    }),
    diagnostics,
    sourceCount: projections.length,
    renderedCount: items.length
  });
}

export function resolveItemsWithSidebarNavigationContent({
  items = [],
  navigationPlan = null,
  navigationState = null,
  grid = DEFAULT_SIDEBAR_CONTENT_GRID,
  targetItemId = null,
  isSidebarItem = defaultIsSidebarItem
} = {}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const contentResult = createSidebarContentFromNavigationPlan({
    navigationPlan,
    navigationState,
    grid
  });
  const targetId = normalizeOptionalId(targetItemId) ?? resolveFirstSidebarItemId(sourceItems, isSidebarItem);

  if (!targetId) {
    return {
      items: sourceItems,
      contentResult
    };
  }

  return {
    items: sourceItems.map((item) => (
      String(item?.id ?? "") === targetId
        ? resolveItemWithSidebarContent(item, contentResult.content)
        : item
    )),
    contentResult
  };
}

function createSidebarNavigationContentItem({ projection, index, x, y, w, h, activePageId }) {
  const pageId = normalizeOptionalId(projection?.pageId);
  const routeId = normalizeOptionalId(projection?.routeId);
  const workspaceId = normalizeOptionalId(projection?.workspaceId);
  const sourceItemId = normalizeOptionalId(projection?.itemId) ?? `item-${index + 1}`;
  const active = Boolean(pageId && activePageId && pageId === activePageId);

  return {
    id: `sidebar-nav-${sourceItemId}`,
    type: SIDEBAR_CONTENT_ITEM_TYPES.NAVIGATION_ITEM,
    x,
    y,
    w,
    h,
    text: normalizeLabel(projection?.label, sourceItemId),
    active,
    navigation: {
      itemId: sourceItemId,
      pageId,
      routeId,
      workspaceId
    },
    action: pageId
      ? {
          type: SIDEBAR_CONTENT_ACTION_TYPES.SELECT_PAGE,
          pageId,
          routeId,
          workspaceId
        }
      : {
          type: SIDEBAR_CONTENT_ACTION_TYPES.NONE
        },
    textFit: SIDEBAR_TEXT_FIT_MODES.WRAP
  };
}

function resolveItemWithSidebarContent(item, content) {
  const existingContent = normalizeSidebarContent(item?.meta?.sidebar?.content);

  return {
    ...item,
    meta: {
      ...(isRecord(item?.meta) ? item.meta : {}),
      sidebar: {
        ...(isRecord(item?.meta?.sidebar) ? item.meta.sidebar : {}),
        content: mergeSidebarContent({
          generatedContent: content,
          existingContent
        })
      }
    }
  };
}

function mergeSidebarContent({ generatedContent, existingContent }) {
  const existingItemsById = new Map(
    (Array.isArray(existingContent?.items) ? existingContent.items : [])
      .map((item) => [String(item.id), item])
  );

  return normalizeSidebarContent({
    ...generatedContent,
    items: generatedContent.items.map((generatedItem) => {
      const existingItem = existingItemsById.get(String(generatedItem.id));

      if (!existingItem) {
        return generatedItem;
      }

      return mergeSidebarNavigationContentItem({
        generatedItem,
        existingItem
      });
    })
  });
}

function mergeSidebarNavigationContentItem({ generatedItem, existingItem }) {
  return mergeEditableSidebarContentItemProps({
    item: {
      ...generatedItem,
      x: existingItem.x,
      y: existingItem.y,
      w: existingItem.w,
      h: existingItem.h,
      text: existingItem.text,
      style: existingItem.style,
      textFit: existingItem.textFit
    },
    existingItem
  });
}

function mergeEditableSidebarContentItemProps({ item, existingItem }) {
  return EDITABLE_SIDEBAR_CONTENT_ITEM_PROPS.reduce((nextItem, prop) => {
    if (!Object.hasOwn(existingItem, prop) || existingItem[prop] === undefined) {
      return nextItem;
    }

    return {
      ...nextItem,
      [prop]: existingItem[prop]
    };
  }, item);
}

const EDITABLE_SIDEBAR_CONTENT_ITEM_PROPS = [
  "disabled",
  "variant"
];

function resolveFirstSidebarItemId(items, isSidebarItem) {
  const item = items.find((currentItem) => (
    typeof isSidebarItem === "function" && isSidebarItem(currentItem)
  ));

  return normalizeOptionalId(item?.id);
}

function defaultIsSidebarItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === "sidebar" ||
    isRecord(item?.meta?.sidebar)
  );
}

function createResult({ content, diagnostics, sourceCount, renderedCount }) {
  return {
    valid: true,
    content,
    diagnostics,
    summary: {
      sourceCount,
      renderedCount,
      skippedCount: Math.max(0, sourceCount - renderedCount),
      diagnostics: diagnostics.length
    }
  };
}

function createDiagnostic({ code, message, itemId = null, details = {} }) {
  return {
    code,
    severity: "warning",
    message,
    itemId,
    details
  };
}

function resolveNavigationPlanInput(value) {
  if (value?.projection || value?.active || value?.navigation) {
    return value;
  }

  if (value?.data?.plan) {
    return value.data.plan;
  }

  if (value?.plan) {
    return value.plan;
  }

  return null;
}

function resolveNavigationProjections(plan) {
  const projections = plan?.projection?.projections;

  return Array.isArray(projections) ? projections : null;
}

function clampGridPosition(value, fallback, maxValue) {
  const number = Math.round(Number(value));
  const resolved = Number.isFinite(number) ? number : fallback;

  return Math.min(Math.max(resolved, 1), Math.max(1, maxValue));
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

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
