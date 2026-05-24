const GEOMETRY_FIELDS = ["x", "y", "w", "h"];

export function normalizeIconStripBarArea(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const x = normalizeOptionalGridNumber(value.x);
  const y = normalizeOptionalGridNumber(value.y);
  const w = normalizeOptionalGridNumber(value.w);
  const h = normalizeOptionalGridNumber(value.h);

  if ([x, y, w, h].some((number) => number === null)) {
    return null;
  }

  return {
    x,
    y,
    w,
    h
  };
}

export function clampIconStripBarAreaToMetrics(area, metrics = {}) {
  const normalized = normalizeIconStripBarArea(area);

  if (!normalized) {
    return null;
  }

  const columns = normalizeGridSize(metrics.columns, 1);
  const rows = normalizeGridSize(metrics.rows, 1);
  const w = Math.min(normalized.w, columns);
  const h = Math.min(normalized.h, rows);
  const x = Math.min(Math.max(normalized.x, 1), Math.max(1, columns - w + 1));
  const y = Math.min(Math.max(normalized.y, 1), Math.max(1, rows - h + 1));

  return { x, y, w, h };
}

export function normalizeIconStripItemsById(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((itemsById, [contentItemId, area]) => {
    const itemId = String(contentItemId ?? "").trim();
    const normalizedArea = normalizeIconStripArea(area);

    if (!itemId || !normalizedArea) {
      return itemsById;
    }

    itemsById[itemId] = normalizedArea;
    return itemsById;
  }, {});
}

export function mergeIconStripItemGeometry(itemsById, contentItemId, patch, grid) {
  const safeItemsById = normalizeIconStripItemsById(itemsById);
  const itemId = String(contentItemId ?? "").trim();

  if (!itemId) {
    return safeItemsById;
  }

  const currentArea = safeItemsById[itemId] ?? { x: 1, y: 1, w: 1, h: 1 };
  const nextArea = normalizeIconStripArea({
    ...currentArea,
    ...pickGeometryPatch(patch)
  }, grid);

  if (!nextArea) {
    return safeItemsById;
  }

  return {
    ...safeItemsById,
    [itemId]: nextArea
  };
}

export function normalizeIconStripLayout(value = {}) {
  const layout = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};

  return {
    barArea: normalizeIconStripBarArea(layout.barArea),
    itemsById: normalizeIconStripItemsById(layout.itemsById)
  };
}

function normalizeIconStripArea(area, grid = null) {
  if (!area || typeof area !== "object" || Array.isArray(area)) {
    return null;
  }

  if (!grid) {
    return {
      x: normalizeGridPosition(area.x, 1),
      y: normalizeGridPosition(area.y, 1),
      w: normalizeGridSize(area.w, 1),
      h: normalizeGridSize(area.h, 1)
    };
  }

  const columns = normalizeGridSize(grid.columns, 1);
  const rows = normalizeGridSize(grid.rows, 1);
  const w = clampGridSize(area.w, 1, columns);
  const h = clampGridSize(area.h, 1, rows);
  const x = clampGridPosition(area.x, 1, columns, w);
  const y = clampGridPosition(area.y, 1, rows, h);

  return { x, y, w, h };
}

function pickGeometryPatch(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return {};
  }

  return GEOMETRY_FIELDS.reduce((safePatch, field) => {
    if (patch[field] !== undefined) {
      safePatch[field] = patch[field];
    }

    return safePatch;
  }, {});
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

function normalizeGridPosition(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}

function normalizeGridSize(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}

function normalizeOptionalGridNumber(value) {
  const number = Math.round(Number(value));

  if (!Number.isFinite(number) || number < 1) {
    return null;
  }

  return number;
}
