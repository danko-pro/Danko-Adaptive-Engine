export const LAYOUT_RELATION_VIEWPORT_MODES = {
  DEFAULT: "default",
  NARROW: "narrow",
  MOBILE: "mobile"
};

const GRID_MODES = {
  COMPACT: "compact",
  COMPACT_WIDTH: "compact-width"
};

const GRID_AXIS_MODES = {
  COMPACT: "compact",
  MIN_LIMIT: "min-limit"
};

export function resolveLayoutRelationViewportMode(metrics) {
  const mode = normalizeMode(metrics?.debug?.mode);
  const horizontalMode = normalizeMode(metrics?.debug?.horizontalMode);

  if (horizontalMode === GRID_AXIS_MODES.MIN_LIMIT) {
    return LAYOUT_RELATION_VIEWPORT_MODES.MOBILE;
  }

  if (
    horizontalMode === GRID_AXIS_MODES.COMPACT ||
    mode === GRID_MODES.COMPACT_WIDTH ||
    mode === GRID_MODES.COMPACT
  ) {
    return LAYOUT_RELATION_VIEWPORT_MODES.NARROW;
  }

  return LAYOUT_RELATION_VIEWPORT_MODES.DEFAULT;
}

function normalizeMode(value) {
  return String(value ?? "").trim();
}
