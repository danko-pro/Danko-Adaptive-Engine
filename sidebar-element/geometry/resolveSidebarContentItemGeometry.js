import { normalizeSidebarContent } from "../contracts/sidebarContent.js";

export const SIDEBAR_CONTENT_GEOMETRY_ERROR_CODES = {
  CONTENT_ITEM_NOT_FOUND: "content-item-not-found",
  CONTENT_ITEM_OVERLAP: "content-item-overlap"
};

const GEOMETRY_PATCH_FIELDS = ["x", "y", "w", "h"];

export function hasSidebarContentItemGeometryPatch(patch = {}) {
  if (!isRecord(patch)) {
    return false;
  }

  return GEOMETRY_PATCH_FIELDS.some((field) => Object.hasOwn(patch, field));
}

export function resolveSidebarContentItemGeometryStatus({
  content,
  contentItemId
} = {}) {
  const normalizedContent = normalizeSidebarContent(content);
  const targetId = normalizeOptionalId(contentItemId);
  const targetItem = normalizedContent.items.find((item) => String(item.id) === targetId);

  if (!targetItem) {
    return createStatus({
      valid: false,
      reason: SIDEBAR_CONTENT_GEOMETRY_ERROR_CODES.CONTENT_ITEM_NOT_FOUND,
      content: normalizedContent,
      contentItem: null,
      collisions: []
    });
  }

  const collisions = normalizedContent.items
    .filter((item) => String(item.id) !== targetId)
    .filter((item) => doGridAreasOverlap(targetItem, item))
    .map((item) => ({
      contentItemId: item.id,
      area: pickGridArea(item)
    }));

  return createStatus({
    valid: collisions.length === 0,
    reason: collisions.length > 0
      ? SIDEBAR_CONTENT_GEOMETRY_ERROR_CODES.CONTENT_ITEM_OVERLAP
      : null,
    content: normalizedContent,
    contentItem: targetItem,
    collisions
  });
}

function doGridAreasOverlap(left, right) {
  const leftArea = pickGridArea(left);
  const rightArea = pickGridArea(right);
  const leftRight = leftArea.x + leftArea.w - 1;
  const leftBottom = leftArea.y + leftArea.h - 1;
  const rightRight = rightArea.x + rightArea.w - 1;
  const rightBottom = rightArea.y + rightArea.h - 1;

  return !(
    leftRight < rightArea.x ||
    rightRight < leftArea.x ||
    leftBottom < rightArea.y ||
    rightBottom < leftArea.y
  );
}

function pickGridArea(item) {
  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
}

function createStatus({
  valid,
  reason,
  content,
  contentItem,
  collisions
}) {
  return {
    valid,
    reason,
    content,
    contentItem,
    collisions
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
