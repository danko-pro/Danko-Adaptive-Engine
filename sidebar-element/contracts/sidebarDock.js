export const SIDEBAR_DOCKS = {
  LEFT: "left",
  RIGHT: "right",
  TOP: "top",
  BOTTOM: "bottom"
};

const KNOWN_DOCKS = new Set(Object.values(SIDEBAR_DOCKS));

export function resolveSidebarDock(value, fallback = SIDEBAR_DOCKS.LEFT) {
  if (KNOWN_DOCKS.has(value)) {
    return value;
  }

  return KNOWN_DOCKS.has(fallback) ? fallback : SIDEBAR_DOCKS.LEFT;
}

export function isSidebarDock(value) {
  return KNOWN_DOCKS.has(value);
}
