import { normalizeSidebarContent } from "../contracts/sidebarContent.js";
import {
  hasSidebarContentItemGeometryPatch,
  resolveSidebarContentItemGeometryStatus
} from "../geometry/resolveSidebarContentItemGeometry.js";
import { applySidebarSettingsCommand } from "./applySidebarSettingsCommand.js";

export function applySidebarContentItemCommand({
  item,
  contentItemId,
  patch = {}
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
