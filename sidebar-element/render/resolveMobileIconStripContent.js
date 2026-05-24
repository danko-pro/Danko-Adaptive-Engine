import { normalizeIconStripItemsById } from "../contracts/iconStripLayout.js";
import { SIDEBAR_CONTENT_GEOMETRY_TARGETS } from "../contracts/sidebarContentGeometryTarget.js";
import { normalizeSidebarContent } from "../contracts/sidebarContent.js";

export function resolveMobileIconStripViewportGrid(viewportArea = {}) {
  return {
    columns: normalizeGridSize(viewportArea?.w, 1),
    rows: normalizeGridSize(viewportArea?.h, 1)
  };
}

export function resolveMobileIconStripContent(
  content = {},
  viewportArea = {},
  mobileLayout = null
) {
  const normalizedContent = normalizeSidebarContent(content);
  const grid = resolveMobileIconStripViewportGrid(viewportArea);
  const itemsById = normalizeIconStripItemsById(mobileLayout?.iconStrip?.itemsById);

  return {
    ...normalizedContent,
    geometryTarget: SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP,
    viewportArea: normalizeViewportArea(viewportArea),
    grid,
    items: resolveMobileIconStripItems({
      items: normalizedContent.items,
      itemsById,
      grid
    })
  };
}

function resolveMobileIconStripItems({ items, itemsById, grid }) {
  if (!Array.isArray(items)) {
    return [];
  }

  const occupied = [];

  return items.map((contentItem, index) => {
    const savedGeometry = itemsById[String(contentItem?.id)];
    const positioned = savedGeometry
      ? normalizeItemGeometry(savedGeometry, grid)
      : packStripItemInRow({
        contentItem,
        grid,
        occupied,
        index
      });

    occupied.push(positioned);

    return {
      ...contentItem,
      ...positioned
    };
  });
}

function packStripItemInRow({ contentItem, grid, occupied, index }) {
  const w = clampGridSize(contentItem?.w, 1, grid.columns);
  const h = clampGridSize(contentItem?.h, 1, grid.rows);
  const maxStartX = Math.max(1, grid.columns - w + 1);

  for (let x = 1; x <= maxStartX; x += 1) {
    const candidate = {
      x,
      y: 1,
      w,
      h
    };

    if (!hasGridOverlap(occupied, candidate)) {
      return candidate;
    }
  }

  return {
    x: clampGridPosition((index % Math.max(1, grid.columns - w + 1)) + 1, 1, grid.columns, w),
    y: 1,
    w,
    h
  };
}

function hasGridOverlap(occupied, candidate) {
  return occupied.some((area) => areasOverlap(area, candidate));
}

function areasOverlap(left, right) {
  const leftRight = left.x + left.w - 1;
  const leftBottom = left.y + left.h - 1;
  const rightRight = right.x + right.w - 1;
  const rightBottom = right.y + right.h - 1;

  return !(
    leftRight < right.x ||
    rightRight < left.x ||
    leftBottom < right.y ||
    rightBottom < left.y
  );
}

function normalizeItemGeometry(area, grid) {
  const w = clampGridSize(area?.w, 1, grid.columns);
  const h = clampGridSize(area?.h, 1, grid.rows);

  return {
    x: clampGridPosition(area?.x, 1, grid.columns, w),
    y: clampGridPosition(area?.y, 1, grid.rows, h),
    w,
    h
  };
}

function normalizeViewportArea(value = {}) {
  return {
    x: normalizeGridNumber(value?.x, 1),
    y: normalizeGridNumber(value?.y, 1),
    w: normalizeGridSize(value?.w, 1),
    h: normalizeGridSize(value?.h, 1)
  };
}

function clampGridPosition(value, fallback, maxValue, size) {
  const maxStart = Math.max(1, maxValue - size + 1);

  return Math.min(
    Math.max(normalizeGridNumber(value, fallback), 1),
    maxStart
  );
}

function clampGridSize(value, fallback, maxValue) {
  return Math.min(normalizeGridSize(value, fallback), Math.max(1, maxValue));
}

function normalizeGridNumber(value, fallback) {
  const number = Math.round(Number(value));

  return Number.isFinite(number) ? number : fallback;
}

function normalizeGridSize(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}
