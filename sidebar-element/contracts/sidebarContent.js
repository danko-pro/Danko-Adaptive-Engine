export const SIDEBAR_CONTENT_ITEM_TYPES = {
  NAVIGATION_ITEM: "navigation-item",
  BUTTON: "button",
  TITLE: "title"
};

export const SIDEBAR_CONTENT_ACTION_TYPES = {
  NONE: "none",
  SELECT_PAGE: "select-page"
};

export const SIDEBAR_TEXT_FIT_MODES = {
  WRAP: "wrap",
  SHRINK: "shrink",
  REQUEST_RESIZE: "request-resize",
  TRUNCATE: "truncate"
};

export const SIDEBAR_CONTENT_TEXT_ALIGNS = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right"
};

export const DEFAULT_SIDEBAR_CONTENT_GRID = {
  columns: 4,
  rows: 20
};

export const DEFAULT_SIDEBAR_CONTENT_ITEM_STYLE = {
  fontSize: 14,
  fontWeight: 600,
  align: SIDEBAR_CONTENT_TEXT_ALIGNS.CENTER
};

const KNOWN_ITEM_TYPES = new Set(Object.values(SIDEBAR_CONTENT_ITEM_TYPES));
const KNOWN_ACTION_TYPES = new Set(Object.values(SIDEBAR_CONTENT_ACTION_TYPES));
const KNOWN_TEXT_FIT_MODES = new Set(Object.values(SIDEBAR_TEXT_FIT_MODES));
const KNOWN_TEXT_ALIGNS = new Set(Object.values(SIDEBAR_CONTENT_TEXT_ALIGNS));
const COLOR_HEX_PATTERN = /^#[0-9a-f]{6}$/i;

export function normalizeSidebarContent(value = {}) {
  const content = normalizeRecord(value);
  const grid = normalizeSidebarContentGrid(content.grid);

  return {
    ...content,
    grid,
    items: normalizeSidebarContentItems(content.items, { grid })
  };
}

export function resolveSidebarContentRequiredGridSize(value = {}) {
  const content = normalizeSidebarContent(value);

  return content.items.reduce((size, item) => ({
    columns: Math.max(size.columns, item.x + item.w - 1),
    rows: Math.max(size.rows, item.y + item.h - 1)
  }), {
    columns: 1,
    rows: 1
  });
}

export function normalizeSidebarContentGrid(value = {}) {
  const grid = normalizeRecord(value);

  return {
    ...grid,
    columns: normalizeGridSize(grid.columns, DEFAULT_SIDEBAR_CONTENT_GRID.columns),
    rows: normalizeGridSize(grid.rows, DEFAULT_SIDEBAR_CONTENT_GRID.rows)
  };
}

export function normalizeSidebarContentItems(items = [], { grid = DEFAULT_SIDEBAR_CONTENT_GRID } = {}) {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalizedGrid = normalizeSidebarContentGrid(grid);
  const seenIds = new Set();

  return items
    .filter((item) => isRecord(item))
    .map((item, index) => normalizeSidebarContentItem(item, {
      index,
      grid: normalizedGrid,
      seenIds
    }));
}

export function resolveSidebarContentItemType(value, fallback = SIDEBAR_CONTENT_ITEM_TYPES.BUTTON) {
  if (KNOWN_ITEM_TYPES.has(value)) {
    return value;
  }

  return KNOWN_ITEM_TYPES.has(fallback) ? fallback : SIDEBAR_CONTENT_ITEM_TYPES.BUTTON;
}

export function resolveSidebarTextFitMode(value, fallback = SIDEBAR_TEXT_FIT_MODES.WRAP) {
  if (KNOWN_TEXT_FIT_MODES.has(value)) {
    return value;
  }

  return KNOWN_TEXT_FIT_MODES.has(fallback) ? fallback : SIDEBAR_TEXT_FIT_MODES.WRAP;
}

function normalizeSidebarContentItem(item, { index, grid, seenIds }) {
  const x = clampGridPosition(item.x, 1, grid.columns);
  const y = clampGridPosition(item.y, 1, grid.rows);

  return {
    ...item,
    id: resolveUniqueSidebarContentItemId(item.id, index, seenIds),
    type: resolveSidebarContentItemType(item.type),
    x,
    y,
    w: clampGridSize(item.w, 1, grid.columns - x + 1),
    h: clampGridSize(item.h, 1, grid.rows - y + 1),
    text: normalizeText(item.text),
    action: normalizeSidebarContentAction(item.action),
    style: normalizeSidebarContentItemStyle(item.style),
    textFit: resolveSidebarTextFitMode(item.textFit)
  };
}

function normalizeSidebarContentAction(value = {}) {
  const action = normalizeRecord(value);
  const type = resolveSidebarContentActionType(action.type);

  if (type === SIDEBAR_CONTENT_ACTION_TYPES.NONE) {
    return { type };
  }

  return {
    ...action,
    type,
    pageId: normalizeOptionalId(action.pageId),
    routeId: normalizeOptionalId(action.routeId),
    workspaceId: normalizeOptionalId(action.workspaceId)
  };
}

function resolveSidebarContentActionType(value, fallback = SIDEBAR_CONTENT_ACTION_TYPES.NONE) {
  if (KNOWN_ACTION_TYPES.has(value)) {
    return value;
  }

  return KNOWN_ACTION_TYPES.has(fallback) ? fallback : SIDEBAR_CONTENT_ACTION_TYPES.NONE;
}

function normalizeSidebarContentItemStyle(value = {}) {
  const style = normalizeRecord(value);
  const normalizedStyle = {
    ...style,
    fontSize: clampNumber(style.fontSize, DEFAULT_SIDEBAR_CONTENT_ITEM_STYLE.fontSize, 6, 96),
    fontWeight: normalizeFontWeight(style.fontWeight),
    align: normalizeTextAlign(style.align)
  };
  const textColor = normalizeOptionalColor(style.textColor);
  const backgroundColor = normalizeOptionalColor(style.backgroundColor);
  const borderColor = normalizeOptionalColor(style.borderColor);
  const textOpacitySource = style.textOpacity ?? style.opacity;
  const backgroundOpacitySource = style.backgroundOpacity ?? style.opacity;

  if (textColor) {
    normalizedStyle.textColor = textColor;
  } else {
    delete normalizedStyle.textColor;
  }

  if (backgroundColor) {
    normalizedStyle.backgroundColor = backgroundColor;
  } else {
    delete normalizedStyle.backgroundColor;
  }

  if (borderColor) {
    normalizedStyle.borderColor = borderColor;
  } else {
    delete normalizedStyle.borderColor;
  }

  if (style.borderWidth !== undefined && style.borderWidth !== null) {
    normalizedStyle.borderWidth = clampNumber(style.borderWidth, 1, 0, 8);
  } else {
    delete normalizedStyle.borderWidth;
  }

  if (textOpacitySource !== undefined && textOpacitySource !== null) {
    normalizedStyle.textOpacity = clampNumber(textOpacitySource, 1, 0.1, 1);
  } else {
    delete normalizedStyle.textOpacity;
  }

  if (backgroundOpacitySource !== undefined && backgroundOpacitySource !== null) {
    normalizedStyle.backgroundOpacity = clampNumber(backgroundOpacitySource, 1, 0.1, 1);
  } else {
    delete normalizedStyle.backgroundOpacity;
  }

  delete normalizedStyle.opacity;

  return normalizedStyle;
}

function normalizeFontWeight(value) {
  if (value === "normal") {
    return 400;
  }

  if (value === "bold") {
    return 700;
  }

  const rounded = Math.round(normalizeNumber(value, DEFAULT_SIDEBAR_CONTENT_ITEM_STYLE.fontWeight) / 100) * 100;

  return Math.min(Math.max(rounded, 100), 900);
}

function normalizeTextAlign(value) {
  if (KNOWN_TEXT_ALIGNS.has(value)) {
    return value;
  }

  return DEFAULT_SIDEBAR_CONTENT_ITEM_STYLE.align;
}

function normalizeOptionalColor(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim().toLowerCase();

  return COLOR_HEX_PATTERN.test(text) ? text : null;
}

function resolveUniqueSidebarContentItemId(value, index, seenIds) {
  const baseId = normalizeOptionalId(value) ?? `sidebar-content-item-${index + 1}`;
  let id = baseId;
  let suffix = 2;

  while (seenIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  seenIds.add(id);
  return id;
}

function clampGridPosition(value, fallback, maxValue) {
  return Math.min(Math.max(normalizeGridNumber(value, fallback), 1), Math.max(1, maxValue));
}

function clampGridSize(value, fallback, maxValue) {
  return Math.min(normalizeGridSize(value, fallback), Math.max(1, maxValue));
}

function normalizeGridSize(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}

function normalizeGridNumber(value, fallback) {
  return Math.round(normalizeNumber(value, fallback));
}

function clampNumber(value, fallback, min, max) {
  return Math.min(Math.max(normalizeNumber(value, fallback), min), max);
}

function normalizeNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function normalizeText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}

function normalizeRecord(value) {
  if (!isRecord(value)) {
    return {};
  }

  return value;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
