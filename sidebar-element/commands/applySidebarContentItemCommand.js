import { mergeIconStripItemGeometry } from "../contracts/iconStripLayout.js";
import { SIDEBAR_CONTENT_GEOMETRY_TARGETS } from "../contracts/sidebarContentGeometryTarget.js";
import { normalizeSidebarContent } from "../contracts/sidebarContent.js";
import {
  hasSidebarContentItemGeometryPatch,
  resolveSidebarContentItemGeometryStatus
} from "../geometry/resolveSidebarContentItemGeometry.js";
import {
  resolveMobileIconStripContent,
  resolveMobileIconStripViewportGrid
} from "../render/resolveMobileIconStripContent.js";
import { applySidebarSettingsCommand } from "./applySidebarSettingsCommand.js";

export function applySidebarContentItemCommand({
  item,
  contentItemId,
  patch = {},
  geometryTarget = SIDEBAR_CONTENT_GEOMETRY_TARGETS.DESKTOP,
  viewportArea = null
} = {}) {
  if (!isRecord(item)) {
    return createResult({
      valid: false,
      changed: false,
      item,
      contentItem: null,
      reason: "invalid-item"
    });
  }

  if (!isSidebarItem(item)) {
    return createResult({
      valid: false,
      changed: false,
      item,
      contentItem: null,
      reason: "item-is-not-sidebar"
    });
  }

  const targetContentItemId = normalizeOptionalId(contentItemId ?? patch?.id);

  if (!targetContentItemId) {
    return createResult({
      valid: false,
      changed: false,
      item,
      contentItem: null,
      reason: "invalid-content-item"
    });
  }

  const previousContent = normalizeSidebarContent(item?.meta?.sidebar?.content);
  const previousContentItem = previousContent.items.find((contentItem) => (
    String(contentItem.id) === targetContentItemId
  ));

  if (!previousContentItem) {
    return createResult({
      valid: false,
      changed: false,
      item,
      contentItem: null,
      reason: "content-item-not-found"
    });
  }

  if (
    geometryTarget === SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP &&
    hasSidebarContentItemGeometryPatch(patch)
  ) {
    return applyIconStripGeometryCommand({
      item,
      contentItemId: targetContentItemId,
      patch,
      previousContent,
      viewportArea
    });
  }

  const nextContentGrid = hasSidebarContentItemGeometryPatch(patch)
    ? resolveGeometryContentGrid({
      grid: previousContent.grid,
      item,
      contentItem: previousContentItem,
      patch
    })
    : previousContent.grid;
  const nextContent = normalizeSidebarContent({
    ...previousContent,
    grid: nextContentGrid,
    items: previousContent.items.map((contentItem) => (
      String(contentItem.id) === targetContentItemId
        ? mergeSidebarContentItemPatch(contentItem, patch)
        : contentItem
    ))
  });
  const geometryStatus = hasSidebarContentItemGeometryPatch(patch)
    ? resolveSidebarContentItemGeometryStatus({
      content: nextContent,
      contentItemId: targetContentItemId
    })
    : null;

  if (geometryStatus && !geometryStatus.valid) {
    return createResult({
      valid: false,
      changed: false,
      item,
      contentItem: previousContentItem,
      reason: geometryStatus.reason,
      details: {
        collisions: geometryStatus.collisions
      }
    });
  }

  const settingsCommand = applySidebarSettingsCommand({
    item,
    settings: {
      content: nextContent
    }
  });

  if (!settingsCommand.valid) {
    return createResult({
      valid: false,
      changed: false,
      item,
      contentItem: null,
      reason: settingsCommand.reason,
      details: {}
    });
  }

  return createResult({
    valid: true,
    changed: settingsCommand.changed,
    item: settingsCommand.item,
    contentItem: findSidebarContentItem(settingsCommand.item, targetContentItemId),
    reason: null,
    details: {}
  });
}

function applyIconStripGeometryCommand({
  item,
  contentItemId,
  patch,
  previousContent,
  viewportArea
}) {
  const previousSidebar = isRecord(item?.meta?.sidebar) ? item.meta.sidebar : {};
  const previousMobileLayout = isRecord(previousSidebar.mobileLayout)
    ? previousSidebar.mobileLayout
    : {};
  const resolvedViewportArea = viewportArea ?? item;
  const grid = resolveMobileIconStripViewportGrid(resolvedViewportArea);
  const nextItemsById = mergeIconStripItemGeometry(
    previousMobileLayout.iconStrip?.itemsById,
    contentItemId,
    patch,
    grid
  );
  const stripContent = resolveMobileIconStripContent(
    previousContent,
    resolvedViewportArea,
    {
      ...previousMobileLayout,
      iconStrip: {
        itemsById: nextItemsById
      }
    }
  );
  const geometryStatus = resolveSidebarContentItemGeometryStatus({
    content: {
      grid: stripContent.grid,
      items: stripContent.items
    },
    contentItemId
  });

  if (!geometryStatus.valid) {
    return createResult({
      valid: false,
      changed: false,
      item,
      contentItem: previousContent.items.find((contentItem) => (
        String(contentItem.id) === String(contentItemId)
      )) ?? null,
      reason: geometryStatus.reason,
      details: {
        collisions: geometryStatus.collisions
      }
    });
  }

  const settingsCommand = applySidebarSettingsCommand({
    item: withCanonicalSidebarContent(item, previousSidebar, previousContent),
    settings: {
      mobileLayout: {
        iconStrip: {
          itemsById: nextItemsById
        }
      }
    }
  });

  if (!settingsCommand.valid) {
    return createResult({
      valid: false,
      changed: false,
      item,
      contentItem: null,
      reason: settingsCommand.reason,
      details: {}
    });
  }

  return createResult({
    valid: true,
    changed: settingsCommand.changed,
    item: settingsCommand.item,
    contentItem: findSidebarContentItem(settingsCommand.item, contentItemId),
    reason: null,
    details: {}
  });
}

function withCanonicalSidebarContent(item, sidebar, content) {
  return {
    ...item,
    meta: {
      ...(isRecord(item?.meta) ? item.meta : {}),
      blockType: item?.meta?.blockType ?? "sidebar",
      sidebar: {
        ...(isRecord(sidebar) ? sidebar : {}),
        content
      }
    }
  };
}

function mergeSidebarContentItemPatch(contentItem, patch) {
  const safePatch = isRecord(patch) ? patch : {};

  return {
    ...contentItem,
    ...safePatch,
    id: contentItem.id,
    action: Object.hasOwn(safePatch, "action") && isRecord(safePatch.action)
      ? {
        ...contentItem.action,
        ...safePatch.action
      }
      : contentItem.action,
    style: Object.hasOwn(safePatch, "style") && isRecord(safePatch.style)
      ? {
        ...contentItem.style,
        ...safePatch.style
      }
      : contentItem.style
  };
}

function findSidebarContentItem(item, contentItemId) {
  const items = Array.isArray(item?.meta?.sidebar?.content?.items)
    ? item.meta.sidebar.content.items
    : [];

  return items.find((contentItem) => String(contentItem.id) === String(contentItemId)) ?? null;
}

function resolveGeometryContentGrid({ grid, item, contentItem, patch }) {
  const safeGrid = isRecord(grid) ? grid : {};
  const hostColumns = normalizeGridSize(item?.w, safeGrid.columns ?? contentItem.x + contentItem.w - 1);
  const hostRows = normalizeGridSize(item?.h, safeGrid.rows ?? contentItem.y + contentItem.h - 1);

  return {
    ...safeGrid,
    columns: Math.max(
      normalizeGridSize(safeGrid.columns, 1),
      hostColumns
    ),
    rows: Math.max(
      normalizeGridSize(safeGrid.rows, 1),
      hostRows
    )
  };
}

function createResult({ valid, changed, item, contentItem, reason, details = {} }) {
  return {
    valid,
    changed,
    item,
    sidebar: item?.meta?.sidebar ?? null,
    content: item?.meta?.sidebar?.content ?? null,
    contentItem,
    reason,
    details
  };
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

function normalizeGridNumber(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.round(number);
}

function normalizeGridSize(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}

function isSidebarItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === "sidebar" ||
    isRecord(item?.meta?.sidebar)
  );
}
