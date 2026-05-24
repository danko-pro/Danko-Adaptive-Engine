import {
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES,
  resolveMobileSidebarContentRenderMode
} from "../../../sidebar-element/index.js";

export const SIDEBAR_OPERATION_CONTENT_SURFACES = {
  DESKTOP_GRID: "desktop-grid",
  COMPACT_BUTTON: "compact-button",
  ICON_STRIP: "icon-strip",
  HIDDEN: "hidden"
};

export function resolveSidebarOperationContentSurface(renderInfo) {
  const renderMode = resolveMobileSidebarContentRenderMode(renderInfo);

  if (renderMode === MOBILE_SIDEBAR_CONTENT_RENDER_MODES.COMPACT_BUTTON) {
    return SIDEBAR_OPERATION_CONTENT_SURFACES.COMPACT_BUTTON;
  }

  if (renderMode === MOBILE_SIDEBAR_CONTENT_RENDER_MODES.ICON_STRIP_CONTENT) {
    return SIDEBAR_OPERATION_CONTENT_SURFACES.ICON_STRIP;
  }

  if (renderMode === MOBILE_SIDEBAR_CONTENT_RENDER_MODES.DESKTOP_CONTENT) {
    return SIDEBAR_OPERATION_CONTENT_SURFACES.DESKTOP_GRID;
  }

  return SIDEBAR_OPERATION_CONTENT_SURFACES.HIDDEN;
}
