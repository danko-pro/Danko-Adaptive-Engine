export const SIDEBAR_STATES = {
  FIXED: "fixed",
  OVERLAY: "overlay",
  COLLAPSED: "collapsed",
  HIDDEN: "hidden"
};

const KNOWN_STATES = new Set(Object.values(SIDEBAR_STATES));

export function resolveSidebarState(value, fallback = SIDEBAR_STATES.OVERLAY) {
  if (KNOWN_STATES.has(value)) {
    return value;
  }

  return KNOWN_STATES.has(fallback) ? fallback : SIDEBAR_STATES.OVERLAY;
}

export function isSidebarState(value) {
  return KNOWN_STATES.has(value);
}
