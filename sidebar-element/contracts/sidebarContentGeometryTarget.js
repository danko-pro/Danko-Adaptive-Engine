export const SIDEBAR_CONTENT_GEOMETRY_TARGETS = {
  DESKTOP: "desktop",
  ICON_STRIP: "icon-strip"
};

export function resolveSidebarContentGeometryTarget(
  value,
  fallback = SIDEBAR_CONTENT_GEOMETRY_TARGETS.DESKTOP
) {
  if (value === SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP) {
    return SIDEBAR_CONTENT_GEOMETRY_TARGETS.ICON_STRIP;
  }

  if (value === SIDEBAR_CONTENT_GEOMETRY_TARGETS.DESKTOP) {
    return SIDEBAR_CONTENT_GEOMETRY_TARGETS.DESKTOP;
  }

  return fallback;
}
