export const PAGE_TRANSITION_TYPES = {
  NONE: "none",
  FADE: "fade",
  SLIDE: "slide"
};

export const PAGE_TRANSITION_DIRECTIONS = {
  AUTO: "auto",
  FORWARD: "forward",
  BACKWARD: "backward",
  UP: "up",
  DOWN: "down"
};

export const DEFAULT_PAGE_TRANSITION = {
  type: PAGE_TRANSITION_TYPES.SLIDE,
  durationMs: 180,
  direction: PAGE_TRANSITION_DIRECTIONS.AUTO
};

const MAX_PAGE_TRANSITION_DURATION_MS = 1200;

export function normalizePageTransitionConfig(config = {}) {
  const input = isRecord(config) ? config : {};
  const type = normalizeEnumValue(
    input.type,
    PAGE_TRANSITION_TYPES,
    DEFAULT_PAGE_TRANSITION.type
  );
  const direction = normalizeEnumValue(
    input.direction,
    PAGE_TRANSITION_DIRECTIONS,
    DEFAULT_PAGE_TRANSITION.direction
  );
  const durationMs = clampInteger(
    input.durationMs ?? input.duration,
    DEFAULT_PAGE_TRANSITION.durationMs,
    0,
    MAX_PAGE_TRANSITION_DURATION_MS
  );

  return {
    type,
    durationMs,
    direction
  };
}

export function createPageTransitionSnapshot({
  fromPageId = null,
  toPageId = null,
  fromWorkspaceId = null,
  toWorkspaceId = null,
  pages = [],
  transition = DEFAULT_PAGE_TRANSITION
} = {}) {
  const config = normalizePageTransitionConfig(transition);
  const resolvedFromPageId = normalizeOptionalId(fromPageId);
  const resolvedToPageId = normalizeOptionalId(toPageId);
  const resolvedFromWorkspaceId = normalizeOptionalId(fromWorkspaceId);
  const resolvedToWorkspaceId = normalizeOptionalId(toWorkspaceId);
  const direction = resolvePageTransitionDirection({
    fromPageId: resolvedFromPageId,
    toPageId: resolvedToPageId,
    pages,
    direction: config.direction
  });
  const active = (
    config.type !== PAGE_TRANSITION_TYPES.NONE &&
    config.durationMs > 0 &&
    Boolean(resolvedFromWorkspaceId) &&
    Boolean(resolvedToWorkspaceId) &&
    resolvedFromWorkspaceId !== resolvedToWorkspaceId
  );

  return {
    active,
    fromPageId: resolvedFromPageId,
    toPageId: resolvedToPageId,
    fromWorkspaceId: resolvedFromWorkspaceId,
    toWorkspaceId: resolvedToWorkspaceId,
    type: config.type,
    durationMs: config.durationMs,
    direction
  };
}

export function resolvePageTransitionDirection({
  fromPageId = null,
  toPageId = null,
  pages = [],
  direction = PAGE_TRANSITION_DIRECTIONS.AUTO
} = {}) {
  const resolvedDirection = normalizeEnumValue(
    direction,
    PAGE_TRANSITION_DIRECTIONS,
    DEFAULT_PAGE_TRANSITION.direction
  );

  if (resolvedDirection !== PAGE_TRANSITION_DIRECTIONS.AUTO) {
    return resolvedDirection;
  }

  const pageIds = Array.isArray(pages)
    ? pages.map((page) => normalizeOptionalId(page?.id)).filter(Boolean)
    : [];
  const fromIndex = pageIds.indexOf(normalizeOptionalId(fromPageId));
  const toIndex = pageIds.indexOf(normalizeOptionalId(toPageId));

  if (fromIndex >= 0 && toIndex >= 0 && toIndex < fromIndex) {
    return PAGE_TRANSITION_DIRECTIONS.BACKWARD;
  }

  return PAGE_TRANSITION_DIRECTIONS.FORWARD;
}

export function splitPageTransitionItems({
  items = [],
  shellItems = [],
  isShellItem = null
} = {}) {
  const shellIds = new Set(
    normalizeItems(shellItems)
      .map((item) => normalizeOptionalId(item?.id))
      .filter(Boolean)
  );
  const result = {
    shellItems: [],
    workspaceItems: []
  };

  for (const item of normalizeItems(items)) {
    const id = normalizeOptionalId(item?.id);
    const shell = (
      (id && shellIds.has(id)) ||
      (typeof isShellItem === "function" && isShellItem(item))
    );

    if (shell) {
      result.shellItems.push(item);
      continue;
    }

    result.workspaceItems.push(item);
  }

  return result;
}

function normalizeEnumValue(value, enumObject, fallback) {
  const text = normalizeOptionalId(value);
  const values = Object.values(enumObject);

  return values.includes(text) ? text : fallback;
}

function clampInteger(value, fallback, min, max) {
  const number = Math.round(Number(value));
  const resolved = Number.isFinite(number) ? number : fallback;

  return Math.min(Math.max(resolved, min), max);
}

function normalizeItems(items) {
  return Array.isArray(items) ? items : [];
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
